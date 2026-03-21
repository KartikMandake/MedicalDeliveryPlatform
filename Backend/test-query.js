const db = require('./src/config/db');

async function debug() {
  try {
    const res = await db.query('SELECT id, name FROM medicines');
    console.log("ALL NAMES IN DATABASE:");
    res.rows.forEach(r => console.log(r.name));
  } catch (e) {
    console.error(e);
  } finally {
    db.pool.end();
  }
}
debug();
