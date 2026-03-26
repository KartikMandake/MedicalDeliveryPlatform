const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  analyzeCartInteractions,
  runDispatchOptimization,
  getInventoryPredictions,
  getDemandForecast
} = require('../controllers/aiController');
const {
  getMediBotMessages,
  chatWithMediBot,
  getMedicationReminders,
  checkDueMedicationReminders,
  cancelMedicationReminder,
} = require('../controllers/medibotController');

router.post('/cart-interactions', protect, analyzeCartInteractions);
router.post('/dispatch-optimization', protect, runDispatchOptimization);
router.post('/inventory-predictions', protect, getInventoryPredictions);
router.post('/demand-forecast', protect, getDemandForecast);
router.get('/medibot/messages', protect, getMediBotMessages);
router.post('/medibot/chat', protect, chatWithMediBot);
router.get('/medibot/reminders', protect, getMedicationReminders);
router.post('/medibot/reminders/check-due', protect, checkDueMedicationReminders);
router.delete('/medibot/reminders/:id', protect, cancelMedicationReminder);

module.exports = router;
