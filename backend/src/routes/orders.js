const router = require('express').Router();
const { createOrder, getMyOrders, getDefaultAddress, getOrder, updateOrderStatus, assignAgent, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/default-address', getDefaultAddress);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('retailer', 'agent', 'admin'), updateOrderStatus);
router.post('/:id/assign-agent', authorize('admin', 'retailer'), assignAgent);
router.put('/:id/cancel', authorize('user', 'admin'), cancelOrder);

module.exports = router;
