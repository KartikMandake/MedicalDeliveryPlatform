const router = require('express').Router();
const { getOrderTracking, updateAgentLocation, getAgentLocation } = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/order/:orderId', getOrderTracking);
router.put('/location', authorize('agent'), updateAgentLocation);
router.get('/agent/:agentId', getAgentLocation);

module.exports = router;
