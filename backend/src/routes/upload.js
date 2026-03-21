const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const fs = require('fs');

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.post('/prescription', protect, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
