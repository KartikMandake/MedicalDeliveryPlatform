const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailer.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', protect, retailerController.registerStore);
router.get('/profile', protect, retailerController.getStoreProfile);
router.get('/orders', protect, retailerController.getAvailableOrders);

module.exports = router;
