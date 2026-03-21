const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/orders', protect, agentController.getAvailableOrders);
router.put('/orders/:orderId/accept', protect, agentController.acceptOrder);
router.put('/orders/:orderId/status', protect, agentController.updateStatus);

module.exports = router;
