const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  analyzeCartInteractions,
  runDispatchOptimization,
  getInventoryPredictions,
  getDemandForecast
} = require('../controllers/aiController');

router.post('/cart-interactions', protect, analyzeCartInteractions);
router.post('/dispatch-optimization', protect, runDispatchOptimization);
router.post('/inventory-predictions', protect, getInventoryPredictions);
router.post('/demand-forecast', protect, getDemandForecast);

module.exports = router;
