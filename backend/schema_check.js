require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: String(process.env.DB_SSL).toLowerCase() === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  await client.connect();
  const query = `
    select table_name, column_name, data_type, udt_name
    from information_schema.columns
    where table_schema='public'
      and table_name in ('orders','order_items','carts','cart_items','inventory','users','medicines','categories')
    order by table_name, ordinal_position
  `;
  const result = await client.query(query);
  console.log(JSON.stringify(result.rows, null, 2));
  await client.end();
})().catch(async (err) => {
  console.error(err.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
