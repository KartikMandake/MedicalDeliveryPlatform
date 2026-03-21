const db = require('./src/config/db');

async function debugImages() {
  try {
    const res = await db.query('SELECT name, images FROM medicines LIMIT 3');
    res.rows.forEach(r => {
      console.log(`\nMedicine: ${r.name}`);
      console.log(`Images length: ${r.images ? r.images.length : 0}`);
      console.log(`Images array:`, r.images);
    });
  } catch (e) {
    console.error(e);
  } finally {
    db.pool.end();
  }
}
debugImages();
