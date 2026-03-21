const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/checkout', protect, ordersController.checkout);
router.put('/:id/status', protect, ordersController.updateOrderStatus);
router.get('/', protect, ordersController.getPatientOrders);

module.exports = router;
