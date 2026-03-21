const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Adding password_hash to users...');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);');
    
    console.log('Making email unique...');
    await db.query('ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);');
    
    console.log('Migration successful.');
  } catch (error) {
    if (error.code === '42P07') {
      console.log('Constraint already exists. Skipping.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    db.pool.end();
  }
}

migrate();
