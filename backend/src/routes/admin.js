const router = require('express').Router();
const { getKPIs, getAllOrders, getAllUsers, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/kpis', getKPIs);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.get('/analytics', getAnalytics);

module.exports = router;
