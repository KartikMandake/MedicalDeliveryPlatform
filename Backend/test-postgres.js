const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function test() {
  try {
    const [{ now }] = await sql`SELECT NOW()`;
    console.log('Postgres.js connected:', now);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await sql.end();
  }
}

test();
