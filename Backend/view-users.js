const db = require('./src/config/db');

async function viewUsers() {
  try {
    const result = await db.query('SELECT id, name, email, phone, role, created_at FROM users');
    console.log('--- CURRENT USERS IN DATABASE ---');
    if (result.rows.length === 0) {
      console.log('No users found in the database yet.');
    } else {
      console.table(result.rows);
    }
    console.log('---------------------------------');
  } catch (err) {
    console.error('Error fetching users:', err.message);
  } finally {
    db.pool.end();
  }
}

viewUsers();
