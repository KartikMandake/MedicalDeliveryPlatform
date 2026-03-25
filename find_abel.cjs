require('dotenv').config({ path: './backend/.env' });
const sequelize = require('./backend/src/db');

async function run() {
  try {
    const r = await sequelize.query(`
      SELECT m.name as med_name, c.name as cat_name 
      FROM medicines m 
      LEFT JOIN categories c ON m.category_id = c.id 
      WHERE m.name ILIKE '%Abel 40%'
    `, { type: 'SELECT' });
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    process.exit();
  }
}

run();
