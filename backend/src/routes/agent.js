const router = require('express').Router();
const { getMyDeliveries, acceptDelivery, rejectDelivery, setOnlineStatus, getPerformance, getHistory } = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('agent'));
router.get('/deliveries', getMyDeliveries);
router.get('/history', getHistory);
router.put('/deliveries/:orderId/accept', acceptDelivery);
router.put('/deliveries/:orderId/reject', rejectDelivery);
router.put('/status', setOnlineStatus);
router.get('/performance', getPerformance);

module.exports = router;
