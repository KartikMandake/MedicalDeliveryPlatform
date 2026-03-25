const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const { uploadPrescription, extractPrescriptionMedicines, verifyPrescriptionForCart } = require('../controllers/uploadController');

function singlePrescriptionUpload(req, res, next) {
	upload.single('prescription')(req, res, (err) => {
		if (!err) return next();

		if (err.name === 'MulterError') {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ message: 'File too large. Max allowed size is 10MB.' });
			}
			return res.status(400).json({ message: err.message || 'Invalid upload request.' });
		}

		return res.status(400).json({ message: err.message || 'Invalid file upload.' });
	});
}

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.post('/prescription', protect, singlePrescriptionUpload, uploadPrescription);
router.post('/prescription/extract', protect, singlePrescriptionUpload, extractPrescriptionMedicines);
router.post('/prescription/verify-cart', protect, singlePrescriptionUpload, verifyPrescriptionForCart);

module.exports = router;
