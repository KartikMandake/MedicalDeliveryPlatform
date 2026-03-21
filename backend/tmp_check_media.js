require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: String(process.env.DB_SSL).toLowerCase() === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  await client.connect();

  const meds = await client.query(`
    SELECT id, name, images
    FROM medicines
    WHERE images IS NOT NULL
    ORDER BY id
    LIMIT 15
  `);

  const cats = await client.query(`
    SELECT id, name, icon_url
    FROM categories
    ORDER BY id
    LIMIT 20
  `);

  console.log('MEDICINE IMAGE SAMPLE');
  console.log(JSON.stringify(meds.rows, null, 2));
  console.log('CATEGORY ICON SAMPLE');
  console.log(JSON.stringify(cats.rows, null, 2));

  await client.end();
})();
