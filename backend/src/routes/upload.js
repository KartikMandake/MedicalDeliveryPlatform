const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const { uploadPrescription, extractPrescriptionMedicines } = require('../controllers/uploadController');

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.post('/prescription', protect, upload.single('prescription'), uploadPrescription);
router.post('/prescription/extract', protect, upload.single('prescription'), extractPrescriptionMedicines);

module.exports = router;
