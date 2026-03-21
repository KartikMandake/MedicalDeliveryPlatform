require('dotenv').config({ path: '../.env' });
const db = require('../src/config/db');

async function fixIcon() {
  await db.query("UPDATE categories SET icon_url='science' WHERE name='Diabetes'");
  console.log('Icon updated!');
  process.exit(0);
}
fixIcon().catch(console.error);
