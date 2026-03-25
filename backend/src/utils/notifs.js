const Notification = require('../models/Notification');

exports.sendNotification = async (req, userId, title, message, type = 'system') => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }
  } catch (err) {
    console.error('Failed to send notification:', err.message);
  }
};
