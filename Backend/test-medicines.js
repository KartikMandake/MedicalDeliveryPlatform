const db = require('./src/config/db');

async function checkData() {
  try {
    await db.query("DELETE FROM medicines WHERE name IN ('Atorvastatin 20mg', 'Vitamin C Complex')");
    console.log("Cleaned up dummy medicines! Now using exclusively the user's real DB data.");
  } catch (e) {
    console.error(e);
  } finally {
    db.pool.end();
  }
}
checkData();
