require('dotenv').config({ path: './backend/.env' });
const sequelize = require('./backend/src/db');

async function run() {
  try {
    console.log('--- DATABASE AUDIT ---');
    const [tables] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    
    for (const { tablename } of tables) {
      try {
        const [countRes] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tablename}"`);
        console.log(`${tablename}: ${countRes[0].count} records`);
      } catch (e) {
        console.log(`${tablename}: Error counting - ${e.message}`);
      }
    }
  } catch (err) {
    console.error('Audit failed:', err.message);
  } finally {
    process.exit();
  }
}

run();
