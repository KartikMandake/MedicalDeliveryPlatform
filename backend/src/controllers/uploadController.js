const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampQuantity(value) {
  const qty = Number(value);
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(90, Math.round(qty)));
}

function clampUnit(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.max(min, Math.min(max, num));
}

function getMimeTypeFromUpload(file) {
  const ext = path.extname(file?.originalname || '').toLowerCase();
  const fromExt = MIME_BY_EXT[ext] || '';
  const fromFile = String(file?.mimetype || '').toLowerCase();
  return fromExt || fromFile;
}

function parseJsonPayload(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;

  const withoutFences = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let payload;
  try {
    payload = JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf('[');
    const end = withoutFences.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      payload = JSON.parse(withoutFences.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return payload;
}

function coerceMedicineItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const medicineName = String(item?.medicineName || item?.name || '').trim();
      if (!medicineName) return null;
      return {
        rawLine: String(item?.rawLine || item?.line || medicineName),
        medicineName,
        dosage: String(item?.dosage || '').trim(),
        quantity: clampQuantity(item?.quantity),
      };
    })
    .filter(Boolean)
    .slice(0, 30);
}

function coercePrescriptionValidation(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const directBool =
    payload.isLikelyGenuinePrescription ??
    payload.isLikelyGenuine ??
    payload.isGenuine ??
    payload.genuine;

  const confidence =
    clampUnit(
      payload.genuinenessConfidence ?? payload.confidence ?? payload.genuinenessScore ?? payload.authenticityScore,
      0,
      1
    );

  const reasons = (Array.isArray(payload.genuinenessReasons) ? payload.genuinenessReasons : [])
    .map((reason) => String(reason || '').trim())
    .filter(Boolean)
    .slice(0, 8);

  let isLikelyGenuine = null;
  if (typeof directBool === 'boolean') {
    isLikelyGenuine = directBool;
  } else if (confidence !== null) {
    isLikelyGenuine = confidence >= 0.6;
  }

  if (isLikelyGenuine === null && confidence === null && reasons.length === 0) return null;

  return {
    isLikelyGenuine,
    confidence,
    reasons,
  };
}

function parseVisionJsonPayload(rawText) {
  const payload = parseJsonPayload(rawText);
  if (!payload) return { items: [], validation: null };

  if (Array.isArray(payload)) {
    return {
      items: coerceMedicineItems(payload),
      validation: null,
    };
  }

  if (typeof payload === 'object') {
    const items = coerceMedicineItems(payload.medicines || payload.items || payload.detectedMedicines);
    const validation = coercePrescriptionValidation(payload);
    return { items, validation };
  }

  return { items: [], validation: null };
}

function buildVisionExtractionPrompt() {
  return [
    'You are reviewing a prescription image/document for medicine extraction and authenticity clues.',
    'Return ONLY a valid JSON object. Do not use markdown fences.',
    'JSON schema:',
    '{',
    '  "isLikelyGenuinePrescription": boolean,',
    '  "genuinenessConfidence": number,',
    '  "genuinenessReasons": string[],',
    '  "medicines": [',
    '    { "medicineName": string, "dosage": string, "quantity": number, "rawLine": string }',
    '  ]',
    '}',
    'Rules:',
    '- isLikelyGenuinePrescription should be true only when the document looks like a real clinical prescription (doctor details/signature/stamp/header/format) and not just a plain handwritten medicine list on normal paper.',
    '- genuinenessConfidence must be between 0 and 1.',
    '- genuinenessReasons should include concise reasons for your decision.',
    '- Include only medicine entries, not patient metadata.',
    '- dosage should be compact when available (e.g., "500mg", "5ml").',
    '- quantity must be a number from 1 to 90. Estimate from frequency and days when needed.',
    '- If uncertain on medicine quantity, use 1.',
  ].join('\n');
}

function getGroqModelCandidates() {
  const configured = String(process.env.GROQ_VISION_MODELS || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  if (configured.length) return configured;
  return [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.2-90b-vision-preview',
    'llama-3.2-11b-vision-preview',
  ];
}

function shouldRejectAsInvalidPrescription(validation, extractedItems) {
  if (!validation || validation.isLikelyGenuine !== false) return false;

  const confidence = Number(validation.confidence);
  const hasStrongConfidence = Number.isFinite(confidence) && confidence >= 0.8;
  const itemCount = Array.isArray(extractedItems) ? extractedItems.length : 0;

  // Reject only when the model is strongly confident and extraction is weak/absent.
  return hasStrongConfidence && itemCount < 2;
}

async function extractWithGroqVision(fileBuffer, mimeType) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not configured.');
    err.statusCode = 503;
    throw err;
  }

  const prompt = buildVisionExtractionPrompt();
  const models = getGroqModelCandidates();
  const transientCodePattern = /(429|500|502|503|504|timeout|temporar)/i;
  const attemptErrors = [];
  let sawRateLimit = false;
  let sawServerError = false;
  let sawAuthError = false;
  const dataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: modelName,
            temperature: 0,
            max_tokens: 1800,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );

        const modelText = response?.data?.choices?.[0]?.message?.content || '';
        const parsedVision = parseVisionJsonPayload(modelText);

        if (parsedVision.items.length) {
          return {
            items: parsedVision.items,
            validation: parsedVision.validation,
            engine: `groq_vision:${modelName}`,
          };
        }

        const looksLikeJson = /^[\[{]/.test(String(modelText || '').trim());
        if (!looksLikeJson) {
          const parsedText = parsePrescriptionText(modelText);
          if (parsedText.length) {
            return {
              items: parsedText,
              validation: parsedVision.validation,
              engine: `groq_vision_text:${modelName}`,
            };
          }
        }

        attemptErrors.push(`${modelName}: empty parse output`);
        break;
      } catch (err) {
        const errorData = err?.response?.data;
        const status = Number(err?.response?.status || 0);
        const remoteMessage =
          typeof errorData?.error?.message === 'string'
            ? errorData.error.message
            : typeof errorData?.message === 'string'
              ? errorData.message
              : '';

        if (status === 429) sawRateLimit = true;
        if (status >= 500) sawServerError = true;
        if (status === 401 || status === 403) sawAuthError = true;

        const raw = String(remoteMessage || err?.message || err || '').trim();
        const message = raw || `http_${status || 'error'}`;
        attemptErrors.push(`${modelName}: ${message}`);

        if (transientCodePattern.test(message) && attempt < 2) {
          await sleep(350 * attempt);
          continue;
        }

        break;
      }
    }
  }

  const fallbackErr = new Error('Groq vision extraction failed.');
  fallbackErr.statusCode = 422;
  fallbackErr.code = 'OCR_EXTRACTION_FAILED';
  fallbackErr.internalDetails = attemptErrors.join(' | ');

  if (sawAuthError) {
    fallbackErr.statusCode = 503;
    fallbackErr.code = 'OCR_SERVICE_UNAVAILABLE';
    fallbackErr.message = 'Prescription OCR service is unavailable.';
  } else if (sawRateLimit || sawServerError) {
    fallbackErr.statusCode = 503;
    fallbackErr.code = 'OCR_SERVICE_BUSY';
    fallbackErr.message = 'Prescription OCR service is busy. Please retry shortly.';
  }

  throw fallbackErr;
}

async function extractTextFromPdf(fileBuffer) {
  const parser = new PDFParse({ data: fileBuffer });
  try {
    const pdfData = await parser.getText();
    return String(pdfData?.text || '').trim();
  } finally {
    if (typeof parser.destroy === 'function') await parser.destroy();
  }
}

function extractFrequency(line) {
  const cleaned = line.toLowerCase();
  if (/(once\s+daily|od\b|1\s*[-x]\s*day|one\s+time\s+a\s+day)/.test(cleaned)) return 1;
  if (/(twice\s+daily|bd\b|2\s*[-x]\s*day|two\s+times\s+a\s+day)/.test(cleaned)) return 2;
  if (/(thrice\s+daily|tds\b|3\s*[-x]\s*day|three\s+times\s+a\s+day)/.test(cleaned)) return 3;

  const timesMatch = cleaned.match(/(\d+)\s*times?\s*(?:a\s*)?day/);
  if (timesMatch) return clampQuantity(timesMatch[1]);

  const everyHours = cleaned.match(/every\s*(\d+)\s*hours?/);
  if (everyHours) {
    const hr = Number(everyHours[1]);
    if (Number.isFinite(hr) && hr > 0) return Math.max(1, Math.round(24 / hr));
  }

  return null;
}

function extractDays(line) {
  const cleaned = line.toLowerCase();
  const dayMatch = cleaned.match(/for\s*(\d+)\s*days?/);
  if (dayMatch) return clampQuantity(dayMatch[1]);
  const shortDayMatch = cleaned.match(/(\d+)\s*days?/);
  if (shortDayMatch) return clampQuantity(shortDayMatch[1]);
  return null;
}

function extractDosageValue(line) {
  const doseMatch = String(line || '').match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)\b/i);
  if (!doseMatch) return '';
  return `${doseMatch[1]}${doseMatch[2].toLowerCase()}`;
}

function extractExplicitQuantity(line) {
  const lower = String(line || '').toLowerCase();

  const unitMatch = lower.match(/(\d{1,3})\s*(tablets?|tabs?|capsules?|caps?|ml|units?|puffs?|drops?|sachets?|injections?|vials?)\b/);
  if (unitMatch) return clampQuantity(unitMatch[1]);

  const countMatch = lower.match(/x\s*(\d{1,3})\b/);
  if (countMatch) return clampQuantity(countMatch[1]);

  return null;
}

function cleanMedicineName(line) {
  return String(line || '')
    .replace(/^\s*(rx|r\/x|tab\.?|cap\.?|inj\.?|syr\.?|take)\s*/i, '')
    .replace(/^\s*[-\d.)]+\s*/, '')
    .replace(/\b(once|twice|thrice|daily|after|before|food|meal|for|days?|morning|night|noon|hs|od|bd|tds)\b.*$/i, '')
    .replace(/[\-:,;|].*$/, '')
    .trim();
}

function parsePrescriptionText(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.length >= 4)
    .slice(0, 300);

  const parsed = [];

  for (const line of lines) {
    const dosage = extractDosageValue(line);
    const explicitQty = extractExplicitQuantity(line);
    const frequency = extractFrequency(line);
    const days = extractDays(line);

    const estimatedQty = explicitQty || (frequency && days ? frequency * days : null) || frequency || 1;
    const maybeName = cleanMedicineName(line);

    // Skip lines that are likely metadata rather than medicine names.
    if (!/[a-z]/i.test(maybeName)) continue;
    if (/^(name|age|date|doctor|patient|address|phone|diagnosis|advice)$/i.test(maybeName)) continue;

    const tokenCount = normalizeText(maybeName).split(' ').filter(Boolean).length;
    if (tokenCount === 0) continue;

    parsed.push({
      rawLine: line,
      medicineName: maybeName,
      dosage,
      quantity: clampQuantity(estimatedQty),
    });
  }

  // Deduplicate by normalized medicine name and keep highest quantity mention.
  const unique = new Map();
  for (const item of parsed) {
    const key = normalizeText(item.medicineName);
    if (!key) continue;
    const prev = unique.get(key);
    if (!prev || item.quantity > prev.quantity) unique.set(key, item);
  }

  return Array.from(unique.values()).slice(0, 20);
}

function scoreCandidate(parsedItem, candidate) {
  const parsedName = normalizeText(parsedItem.medicineName);
  const candidateName = normalizeText(candidate.name);
  const saltName = normalizeText(candidate.saltName);

  if (!parsedName || !candidateName) return 0;

  let score = 0;

  if (candidateName.includes(parsedName)) score += 4;
  if (parsedName.includes(candidateName)) score += 3;
  if (saltName && (saltName.includes(parsedName) || parsedName.includes(saltName))) score += 2;

  const parsedTokens = parsedName.split(' ').filter(Boolean);
  const candidateTokens = new Set(`${candidateName} ${saltName}`.split(' ').filter(Boolean));
  const overlap = parsedTokens.filter((token) => candidateTokens.has(token)).length;
  score += overlap * 1.1;

  if (parsedItem.dosage && `${candidate.name} ${candidate.saltName || ''}`.toLowerCase().includes(parsedItem.dosage)) {
    score += 2;
  }

  if (Number(candidate.stock || 0) > 0) score += 0.4;

  return score;
}

async function findBestProductMatch(parsedItem) {
  const tokens = normalizeText(parsedItem.medicineName).split(' ').filter(Boolean);
  if (!tokens.length) return null;

  const searchTerm = `%${tokens.slice(0, 3).join('%')}%`;
  const rows = await sequelize.query(
    `
    SELECT
      m.id,
      m.name,
      m.salt_name AS "saltName",
      m.requires_rx AS "requiresPrescription",
      COALESCE(m.selling_price, m.mrp, 0)::float AS price,
      COALESCE(inv.stock_quantity, 0)::int AS stock
    FROM medicines m
    LEFT JOIN (
      SELECT
        medicine_id,
        SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
      FROM inventory
      GROUP BY medicine_id
    ) inv ON inv.medicine_id = m.id
    WHERE m.is_active = TRUE
      AND (m.name ILIKE :search OR COALESCE(m.salt_name, '') ILIKE :search)
    ORDER BY COALESCE(inv.stock_quantity, 0) DESC, m.name ASC
    LIMIT 15
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { search: searchTerm },
    }
  );

  if (!rows.length) return null;

  const scored = rows
    .map((row) => ({ ...row, score: scoreCandidate(parsedItem, row) }))
    .sort((a, b) => b.score - a.score);

  const winner = scored[0];
  if (!winner || winner.score < 2.6) return null;
  return winner;
}

async function appendToCart(userId, productId, quantity) {
  const parsedQty = clampQuantity(quantity);

  await sequelize.transaction(async (transaction) => {
    const cartRows = await sequelize.query(
      `
      SELECT id
      FROM carts
      WHERE user_id = :userId
        AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { userId },
        transaction,
      }
    );

    let cartId = cartRows[0]?.id;

    if (!cartId) {
      const inserted = await sequelize.query(
        `
        INSERT INTO carts (user_id, is_active, created_at, updated_at)
        VALUES (:userId, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { userId },
          transaction,
        }
      );
      cartId = inserted[0]?.id;
    }

    const medicineRows = await sequelize.query(
      `
      SELECT COALESCE(selling_price, mrp, 0)::float AS price
      FROM medicines
      WHERE id = :productId
        AND is_active = TRUE
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { productId },
        transaction,
      }
    );

    if (!medicineRows[0]) return;

    await sequelize.query(
      `
      INSERT INTO cart_items (cart_id, medicine_id, quantity, unit_price, total_price, created_at, updated_at)
      VALUES (:cartId, :productId, :quantity, :unitPrice, :totalPrice, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (cart_id, medicine_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        unit_price = EXCLUDED.unit_price,
        total_price = (cart_items.quantity + EXCLUDED.quantity) * EXCLUDED.unit_price,
        updated_at = CURRENT_TIMESTAMP
      `,
      {
        replacements: {
          cartId,
          productId,
          quantity: parsedQty,
          unitPrice: Number(medicineRows[0].price || 0),
          totalPrice: Number(medicineRows[0].price || 0) * parsedQty,
        },
        transaction,
      }
    );
  });
}

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.extractPrescriptionMedicines = async (req, res) => {
  let localFilePath = '';
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    localFilePath = req.file.path;

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const mimeType = getMimeTypeFromUpload(req.file);
    const isPdf = ext === '.pdf' || mimeType === 'application/pdf';

    if (!SUPPORTED_MIME_TYPES.has(mimeType) && !Object.prototype.hasOwnProperty.call(MIME_BY_EXT, ext)) {
      return res.status(400).json({ message: 'Please upload a prescription as PDF, JPG, PNG, or WEBP.' });
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    let extractedText = '';
    let parsedMedicines = [];
    let extractionEngine = 'groq_vision';
    let prescriptionValidation = null;

    if (isPdf) {
      extractedText = await extractTextFromPdf(fileBuffer);
      if (extractedText) {
        parsedMedicines = parsePrescriptionText(extractedText);
        if (parsedMedicines.length) extractionEngine = 'pdf_text_layer';
      }
    }

    if (!parsedMedicines.length) {
      const normalizedMime = mimeType || MIME_BY_EXT[ext] || 'application/pdf';
      try {
        const groqResult = await extractWithGroqVision(fileBuffer, normalizedMime);
        prescriptionValidation = groqResult.validation || null;

        if (shouldRejectAsInvalidPrescription(groqResult.validation, groqResult.items)) {
          return res.status(422).json({
            errorCode: 'PRESCRIPTION_INVALID',
            message: 'Prescription is not valid. Please upload a genuine doctor-issued prescription.',
            prescriptionValidation: {
              source: 'groq',
              ...groqResult.validation,
            },
          });
        }

        if (Array.isArray(groqResult.items) && groqResult.items.length) {
          parsedMedicines = groqResult.items;
          extractionEngine = groqResult.engine;
        }
      } catch (groqErr) {
        const statusCode = Number(groqErr?.statusCode || 0);
        if (statusCode >= 500) {
          return res.status(statusCode).json({
            errorCode: 'OCR_SERVICE_UNAVAILABLE',
            message: 'Prescription OCR is temporarily unavailable. Please try again shortly.',
          });
        }

        return res.status(422).json({
          errorCode: 'PRESCRIPTION_UNREADABLE',
          message: 'Could not read this prescription. Please upload a clearer image/PDF with visible medicine names.',
        });
      }

      if (shouldRejectAsInvalidPrescription(prescriptionValidation, parsedMedicines)) {
        return res.status(422).json({
          errorCode: 'PRESCRIPTION_INVALID',
          message: 'Prescription is not valid. Please upload a genuine doctor-issued prescription.',
          prescriptionValidation,
        });
      }

      if (!parsedMedicines.length) {
        return res.status(422).json({
          errorCode: 'PRESCRIPTION_UNREADABLE',
          message: 'Could not read this prescription. Please upload a clearer image/PDF with visible medicine names.',
        });
      }
    }

    if (!parsedMedicines.length) {
      return res.status(422).json({
        errorCode: 'PRESCRIPTION_NO_MEDICINES',
        message: 'No medicine entries were detected in this prescription. Please upload a clearer prescription.',
      });
    }

    const detectionResults = [];

    for (const parsed of parsedMedicines) {
      const match = await findBestProductMatch(parsed);
      detectionResults.push({
        ...parsed,
        matchedProduct: match
          ? {
              id: match.id,
              name: match.name,
              saltName: match.saltName,
              requiresPrescription: match.requiresPrescription,
              price: Number(match.price || 0),
              stock: Number(match.stock || 0),
            }
          : null,
      });
    }

    const matchedForCart = detectionResults
      .filter((item) => item.matchedProduct && Number(item.matchedProduct.stock || 0) > 0)
      .map((item) => ({
        productId: item.matchedProduct.id,
        name: item.matchedProduct.name,
        quantity: clampQuantity(item.quantity),
      }));

    const uniqueByProduct = new Map();
    for (const item of matchedForCart) {
      const prev = uniqueByProduct.get(item.productId);
      if (!prev || item.quantity > prev.quantity) {
        uniqueByProduct.set(item.productId, item);
      }
    }

    const uniqueCartItems = Array.from(uniqueByProduct.values());

    for (const item of uniqueCartItems) {
      await appendToCart(req.user.id, item.productId, item.quantity);
    }

    return res.json({
      message: uniqueCartItems.length
        ? 'Prescription processed and detected medicines were added to cart.'
        : 'Prescription processed, but no in-stock matching medicines were found to add.',
      extractionEngine,
      prescriptionValidation: prescriptionValidation || {
        isLikelyGenuine: null,
        confidence: null,
        reasons: [],
      },
      sourceType: isPdf ? 'pdf' : 'image',
      extractedCount: detectionResults.length,
      addedToCartCount: uniqueCartItems.length,
      items: detectionResults,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to process prescription.' });
  } finally {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, () => {});
    }
  }
};
