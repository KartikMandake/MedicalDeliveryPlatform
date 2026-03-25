require('dotenv').config({ path: './backend/.env' });
const sequelize = require('./backend/src/db');

async function run() {
  try {
    const r = await sequelize.query(`
      SELECT 
        i.id as inventory_id,
        m.name as med_name,
        m.category_id as med_cat_id,
        c.id as cat_table_id,
        c.name as cat_name
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      LEFT JOIN categories c ON m.category_id = c.id
      LIMIT 10
    `, { type: 'SELECT' });
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    process.exit();
  }
}

run();
