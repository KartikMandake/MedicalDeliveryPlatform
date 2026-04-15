const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_TIMEOUT_MS = 25000;

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizePredictions = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const direct = Array.isArray(payload.predictions) ? payload.predictions : null;
  if (direct) {
    return direct.map((value) => toNumber(value, 0));
  }

  const nested = Array.isArray(payload.data?.predictions) ? payload.data.predictions : null;
  if (nested) {
    return nested.map((value) => toNumber(value, 0));
  }

  return null;
};

const getRepoRoot = () => path.resolve(__dirname, '../../..');

const getInferenceScriptPath = () => {
  const customScript = process.env.MEDIFLOW_INFERENCE_SCRIPT;
  if (customScript) {
    return path.isAbsolute(customScript)
      ? customScript
      : path.resolve(getRepoRoot(), customScript);
  }
  return path.resolve(getRepoRoot(), 'model', 'mediflow_inference.py');
};

const getArtifactsDir = () => {
  const customArtifacts = process.env.MEDIFLOW_ARTIFACTS_DIR;
  if (customArtifacts) {
    return path.isAbsolute(customArtifacts)
      ? customArtifacts
      : path.resolve(getRepoRoot(), customArtifacts);
  }
  return path.resolve(getRepoRoot(), 'model', 'artifacts');
};

const getTimeout = () => {
  const configured = toNumber(process.env.ML_INFERENCE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  return configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
};

const getPythonCandidates = () => {
  const repoRoot = getRepoRoot();
  const configured = process.env.MEDIFLOW_PYTHON_BIN || process.env.PYTHON_BIN;

  const candidates = [];
  if (configured) {
    candidates.push(configured);
  }

  candidates.push(
    path.resolve(repoRoot, '.venv', 'Scripts', 'python.exe'),
    path.resolve(repoRoot, 'model', '.venv', 'Scripts', 'python.exe'),
    path.resolve(repoRoot, 'backend', '.venv', 'Scripts', 'python.exe'),
    'python'
  );

  const seen = new Set();
  return candidates.filter((candidate) => {
    const normalized = String(candidate || '').trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const buildHttpCandidates = () => {
  const base = String(process.env.ML_INFERENCE_URL || '').trim();
  if (!base) return [];

  const normalizedBase = base.replace(/\/+$/, '');
  if (/\/predict(\/demand)?$/i.test(normalizedBase)) {
    return [normalizedBase];
  }

  return [`${normalizedBase}/predict/demand`, `${normalizedBase}/predict`];
};

async function runHttpInference(rows, target) {
  const candidates = buildHttpCandidates();
  if (!candidates.length) {
    throw new Error('ML_INFERENCE_URL is not configured');
  }

  const payload = { rows, target };
  const timeout = getTimeout();
  const failures = [];

  for (const url of candidates) {
    try {
      const response = await axios.post(url, payload, { timeout });
      const predictions = normalizePredictions(response.data);
      if (!predictions || predictions.length !== rows.length) {
        throw new Error('Invalid prediction payload from HTTP inference service');
      }

      return {
        ok: true,
        source: 'http',
        endpoint: url,
        predictions,
        selection: response.data?.selection || null,
      };
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
    }
  }

  throw new Error(`HTTP inference failed. ${failures.join(' | ')}`);
}

async function runLocalInference(rows, target) {
  const scriptPath = getInferenceScriptPath();
  const artifactsDir = getArtifactsDir();

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Inference script not found at ${scriptPath}`);
  }
  if (!fs.existsSync(artifactsDir)) {
    throw new Error(`Artifacts directory not found at ${artifactsDir}`);
  }
  if (!fs.existsSync(path.join(artifactsDir, 'lightgbm_model.txt'))) {
    throw new Error(`lightgbm_model.txt not found in ${artifactsDir}`);
  }

  const timeout = getTimeout();
  const pythonCandidates = getPythonCandidates();

  const payload = JSON.stringify({ rows, target });

  const runWithBinary = (pythonBin) => new Promise((resolve, reject) => {
    const args = [
      scriptPath,
      '--artifacts-dir',
      artifactsDir,
      '--target',
      target,
    ];

    const child = spawn(pythonBin, args, {
      cwd: getRepoRoot(),
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      child.kill('SIGTERM');
      reject(new Error(`Local model inference timed out after ${timeout}ms (bin: ${pythonBin})`));
    }, timeout);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(new Error(`${pythonBin}: ${error.message}`));
    });

    child.on('close', (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);

      const output = stdout.trim();
      const outputLines = output ? output.split(/\r?\n/).filter(Boolean) : [];
      const lastLine = outputLines.length ? outputLines[outputLines.length - 1] : '';

      let parsed;
      try {
        parsed = output ? JSON.parse(output) : null;
      } catch {
        try {
          parsed = lastLine ? JSON.parse(lastLine) : null;
        } catch {
          parsed = null;
        }
      }

      if (code !== 0) {
        const errorMessage = parsed?.error || stderr.trim() || `Inference process exited with code ${code}`;
        reject(new Error(`${pythonBin}: ${errorMessage}`));
        return;
      }

      const predictions = normalizePredictions(parsed);
      if (!predictions || predictions.length !== rows.length) {
        reject(new Error(`${pythonBin}: Invalid prediction payload from local inference script`));
        return;
      }

      resolve({
        ok: true,
        source: 'local-python',
        scriptPath,
        pythonBin,
        predictions,
        selection: parsed?.selection || null,
      });
    });

    child.stdin.on('error', (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(new Error(`${pythonBin} (stdin): ${err.message}`));
    });

    if (child.stdin.writable) {
      child.stdin.write(payload);
      child.stdin.end();
    }
  });

  const failures = [];
  for (const pythonBin of pythonCandidates) {
    if (pythonBin.includes(path.sep) && !fs.existsSync(pythonBin)) {
      failures.push(`${pythonBin}: not found`);
      continue;
    }

    try {
      console.log(`[inference] Attempting local inference with: ${pythonBin}`);
      return await runWithBinary(pythonBin);
    } catch (error) {
      failures.push(error.message);
    }
  }

  throw new Error(failures.join(' | '));
}

async function predictDemandFromModel({ rows, target = 'units_sold_today' }) {
  if (!Array.isArray(rows)) {
    return { ok: false, source: 'none', error: 'rows must be an array' };
  }

  if (!rows.length) {
    return {
      ok: true,
      source: 'none',
      predictions: [],
      selection: { strategy: 'none', lgb_weight: 0, xgb_weight: 0 },
    };
  }

  const failures = [];

  try {
    if (buildHttpCandidates().length) {
      return await runHttpInference(rows, target);
    }
  } catch (error) {
    failures.push(`http: ${error.message}`);
  }

  try {
    return await runLocalInference(rows, target);
  } catch (error) {
    failures.push(`local: ${error.message}`);
  }

  return {
    ok: false,
    source: 'none',
    error: failures.join(' | ') || 'No inference backend available',
  };
}

module.exports = {
  predictDemandFromModel,
};
