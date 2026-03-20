const router = require('express').Router();
const { createOrder, getMyOrders, getOrder, updateOrderStatus, assignAgent } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('retailer', 'agent', 'admin'), updateOrderStatus);
router.post('/:id/assign-agent', authorize('admin', 'retailer'), assignAgent);

module.exports = router;
