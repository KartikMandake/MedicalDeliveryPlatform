const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { scanPrescription } = require('../controllers/upload.controller');
const fs = require('fs');

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Simple file save (used by cart prescription upload)
router.post('/prescription', protect, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Scan prescription with Gemini + DB match (auth disabled for testing)
router.post('/scan-prescription', upload.single('prescription'), scanPrescription);

module.exports = router;
