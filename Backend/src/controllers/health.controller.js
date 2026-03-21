const db = require('../config/db');

exports.checkHealth = async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'UP',
      db: 'Connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      db: 'Disconnected',
      error: error.message,
    });
  }
};
