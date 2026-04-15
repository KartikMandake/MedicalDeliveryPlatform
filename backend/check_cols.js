require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:KCFdODEYKlCgjsNaxxYSVRczVmLfxSyJ@caboose.proxy.rlwy.net:41485/railway';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

async function run() {
  try {
    const rows = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory' ORDER BY ordinal_position",
      { type: QueryTypes.SELECT }
    );
    console.log('Inventory columns:', rows.map(r => r.column_name).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
