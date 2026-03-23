const router = require('express').Router();
const { verifyPickupOtp, verifyDeliveryOtp, generatePickupOtp } = require('../controllers/otpController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/generate-pickup', authorize('retailer', 'admin'), generatePickupOtp);
router.post('/verify-pickup', authorize('agent'), verifyPickupOtp);
router.post('/verify-delivery', authorize('agent'), verifyDeliveryOtp);

module.exports = router;
