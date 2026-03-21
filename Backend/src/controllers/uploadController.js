const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.5-flash';

// Extract longest meaningful token from a medicine name string
const extractToken = (name) => {
  const stopWords = new Set(['tab', 'tablet', 'cap', 'capsule', 'syrup', 'inj', 'injection', 'mg', 'ml', 'mcg', 'drops', 'cream', 'gel', 'ointment']);
  const tokens = name.toLowerCase().split(/\s+|\/|-/);
  return tokens
    .filter((t) => t.length > 3 && !stopWords.has(t) && !/^\d+$/.test(t))
    .sort((a, b) => b.length - a.length)[0] || name.split(' ')[0];
};

// 3-tier fuzzy match against medicines table
const matchMedicine = async (extracted) => {
  const { name, generic, dosage } = extracted;
  const fullQuery = dosage ? `${name} ${dosage}` : name;

  // Tier 1: full brand name + dosage match
  let rows = await sequelize.query(
    `SELECT id, name, salt_name, manufacturer, type, selling_price, mrp, requires_rx, images
     FROM medicines WHERE name ILIKE :q AND is_active = true LIMIT 3`,
    { replacements: { q: `%${fullQuery}%` }, type: QueryTypes.SELECT }
  );
  if (rows.length) return rows;

  // Tier 2: generic/salt name match (most reliable for brand names)
  if (generic) {
    const genericToken = generic.split(' ')[0]; // e.g. "Paracetamol" from "Paracetamol 250mg"
    rows = await sequelize.query(
      `SELECT id, name, salt_name, manufacturer, type, selling_price, mrp, requires_rx, images
       FROM medicines WHERE salt_name ILIKE :q AND is_active = true LIMIT 3`,
      { replacements: { q: `%${genericToken}%` }, type: QueryTypes.SELECT }
    );
    if (rows.length) return rows;
  }

  // Tier 3: brand name token match on medicine name
  const token = extractToken(name);
  rows = await sequelize.query(
    `SELECT id, name, salt_name, manufacturer, type, selling_price, mrp, requires_rx, images
     FROM medicines WHERE name ILIKE :q AND is_active = true LIMIT 3`,
    { replacements: { q: `%${token}%` }, type: QueryTypes.SELECT }
  );
  if (rows.length) return rows;

  // Tier 4: token match on salt_name
  rows = await sequelize.query(
    `SELECT id, name, salt_name, manufacturer, type, selling_price, mrp, requires_rx, images
     FROM medicines WHERE salt_name ILIKE :q AND is_active = true LIMIT 3`,
    { replacements: { q: `%${token}%` }, type: QueryTypes.SELECT }
  );
  return rows;
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
    const prompt = `You are a medical prescription parser. Extract all medicines from this prescription image.
Return ONLY a valid JSON array with no markdown, no explanation:
[{"name": "brand name", "generic": "generic/salt name e.g. Paracetamol", "dosage": "strength like 500mg", "quantity": number, "form": "tablet/syrup/etc"}]
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
