const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running schema.sql...');
    await db.query(sql);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Error creating database schema:', error);
  } finally {
    db.pool.end();
  }
}

initDb();
