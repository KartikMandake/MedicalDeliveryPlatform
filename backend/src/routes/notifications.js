const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
