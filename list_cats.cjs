require('dotenv').config({ path: './backend/.env' });
const sequelize = require('./backend/src/db');

async function run() {
  try {
    const r = await sequelize.query(`
      SELECT c.name, COUNT(*) as count 
      FROM medicines m 
      JOIN categories c ON m.category_id = c.id 
      GROUP BY c.name 
      ORDER BY count DESC 
      LIMIT 30
    `, { type: 'SELECT' });
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    process.exit();
  }
}

run();
