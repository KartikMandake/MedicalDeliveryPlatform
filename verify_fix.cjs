require('dotenv').config({ path: './backend/.env' });
const sequelize = require('./backend/src/db');
const predictStock = require('./backend/src/utils/predictStock');

async function run() {
  try {
    const [retailer] = await sequelize.query("SELECT id FROM retailers LIMIT 1");
    if (!retailer[0]) {
      console.log('No retailers found');
      return;
    }
    const id = retailer[0].id;
    console.log(`Testing prediction for Retailer ID: ${id}`);
    const data = await predictStock(id);
    console.log(`Success! Found ${data.length} predictions (including those with 0 sales).`);
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    process.exit();
  }
}

run();
