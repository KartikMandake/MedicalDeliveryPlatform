const router = require('express').Router();
const { createRazorpayOrder, verifyPayment, getPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/', authorize('admin', 'retailer'), getPayments);

// Next disbursement: always next midnight
router.get('/next-disbursement', (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  res.json({ nextRun: tomorrow.toISOString() });
});

module.exports = router;
