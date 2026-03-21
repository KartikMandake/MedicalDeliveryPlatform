const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicines.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/recommended', protect, medicinesController.getRecommended);
router.get('/', protect, medicinesController.getAll);

module.exports = router;
