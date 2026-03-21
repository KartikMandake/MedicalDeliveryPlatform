const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.5-flash';

// Extract longest meaningful token from a medicine name string
const extractToken = (name) => {
  const stopWords = new Set(['tab', 'tablet', 'cap', 'capsule', 'syrup', 'inj', 'injection', 'mg', 'ml', 'mcg', 'drops', 'cream', 'gel', 'ointment']);
  const tokens = name.toLowerCase().split(/\s+|[/]|-/);
  return tokens
    .filter((t) => t.length > 3 && !stopWords.has(t) && !/^\d+$/.test(t))
    .sort((a, b) => b.length - a.length)[0] || name.split(' ')[0];
};

const matchMedicine = async (extracted) => {
  const { name, generic, dosage, form } = extracted;
  
  const fullQuery = dosage ? `${name} ${dosage}` : name;
  const dbNameQuery = `%${fullQuery}%`;
  const dbGenericQuery = generic ? `%${generic.split(' ')[0]}%` : null;
  const dbTypeQuery = form && form.length >= 3 ? `%${form.toLowerCase().slice(0, 3)}%` : null;
  
  // SAFETY FEATURE: If the prescribed generic is a single ingredient (no + or 'and'), 
  // do NOT match combination drugs from the DB.
  const isCombo = generic && (generic.includes('+') || generic.toLowerCase().includes(' and '));
  const excludeComboSql = !isCombo ? " AND salt_name NOT LIKE '%+%' AND salt_name NOT ILIKE '% and %'" : "";

  const token = extractToken(name);
  const selectCols = `id, name, salt_name, manufacturer, type, selling_price, mrp, requires_rx, images`;

  let result;

  // Tier 1: Brand name + dosage + exact type matching
  if (dbTypeQuery) {
    result = await db.query(
      `SELECT ${selectCols} FROM medicines WHERE name ILIKE $1 AND type::text ILIKE $2 AND is_active = true LIMIT 3`,
      [dbNameQuery, dbTypeQuery]
    );
    if (result.rows.length) return result.rows;
  }

  // Tier 2: Brand name + dosage matching
  result = await db.query(
    `SELECT ${selectCols} FROM medicines WHERE name ILIKE $1 AND is_active = true LIMIT 3`,
    [dbNameQuery]
  );
  if (result.rows.length) return result.rows;

  // Tier 3: Generic name matching (STRONGLY require type AND check combination safety)
  if (dbGenericQuery) {
    if (dbTypeQuery) {
      result = await db.query(
        `SELECT ${selectCols} FROM medicines WHERE salt_name ILIKE $1 ${excludeComboSql} AND type::text ILIKE $2 AND is_active = true LIMIT 3`,
        [dbGenericQuery, dbTypeQuery]
      );
      if (result.rows.length) return result.rows;
    } else {
      result = await db.query(
        `SELECT ${selectCols} FROM medicines WHERE salt_name ILIKE $1 ${excludeComboSql} AND is_active = true LIMIT 3`,
        [dbGenericQuery]
      );
      if (result.rows.length) return result.rows;
    }
  }

  // Tier 4: Fallback token tracking (MUST require type + combination safety)
  if (dbTypeQuery) {
    result = await db.query(
      `SELECT ${selectCols} FROM medicines WHERE (name ILIKE $1 OR salt_name ILIKE $1) ${excludeComboSql} AND type::text ILIKE $2 AND is_active = true LIMIT 3`,
      [`%${token}%`, dbTypeQuery]
    );
    if (result.rows.length) return result.rows;
  } else {
    result = await db.query(
      `SELECT ${selectCols} FROM medicines WHERE (name ILIKE $1 OR salt_name ILIKE $1) ${excludeComboSql} AND is_active = true LIMIT 3`,
      [`%${token}%`]
    );
    if (result.rows.length) return result.rows;
  }

  return [];
};

exports.scanPrescription = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
  const prescriptionUrl = `/uploads/${req.file.filename}`;

  try {
    // Read file as base64
    const fileData = fs.readFileSync(filePath);
    const base64 = fileData.toString('base64');
    const mimeType = req.file.mimetype === 'application/pdf' ? 'application/pdf' : req.file.mimetype;

    // Call Gemini Vision
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `You are an expert pharmacist AI parsing a prescription image.
Extract the prescribed medicines accurately.
Return ONLY a valid JSON array with no markdown, no explanation:
[
  {
    "name": "brand name (e.g. Calpol)",
    "generic": "active ingredients/salt name. If multiple, separate with '+' (e.g. Paracetamol + Camylofin)",
    "dosage": "strength (e.g. 250mg/5mL)",
    "quantity": number,
    "form": "tablet/syrup/drops/injection/ointment"
  }
]
If no medicines found, return [].`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } },
    ]);

    const text = result.response.text().trim();

    // Parse JSON — strip markdown code fences if Gemini adds them
    const jsonStr = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    let extracted = [];
    try {
      extracted = JSON.parse(jsonStr);
      if (!Array.isArray(extracted)) extracted = [];
    } catch {
      extracted = [];
    }

    // Match each extracted medicine against DB
    const results = await Promise.all(
      extracted.map(async (item) => {
        const matched = await matchMedicine(item);
        // Fix images array — stored as split URL parts in DB, join them back
        const fixedMatched = matched.map((m) => ({
          ...m,
          image: Array.isArray(m.images) ? m.images.join('/') : m.images,
          images: undefined,
        }));
        return { extracted: item, matched: fixedMatched };
      })
    );

    res.json({ prescriptionUrl, results });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ message: 'Prescription scan failed', error: err.message });
  }
};
