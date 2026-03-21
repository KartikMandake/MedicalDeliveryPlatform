const db = require('./src/config/db');

async function seed() {
  try {
    console.log('Seeding dummy categories and medicines...');

    // Categories
    const catRes = await db.query(`
      INSERT INTO categories (name, description, icon_url)
      VALUES 
        ('Cardiology', 'Heart health and blood pressure', 'favorite'),
        ('Dermatology', 'Skin care and treatments', 'healing'),
        ('Pediatrics', 'Childrens health', 'child_care'),
        ('Wellness', 'Vitamins and supplements', 'spa')
      RETURNING id, name
    `);
    
    const categories = catRes.rows;
    const cardiologyId = categories.find(c => c.name === 'Cardiology').id;
    const wellnessId = categories.find(c => c.name === 'Wellness').id;

    // Medicines
    await db.query(`
      INSERT INTO medicines (name, manufacturer, category_id, type, section, selling_price, mrp, requires_rx, description, images)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, [
      // Atorvastatin
      'Atorvastatin 20mg', 'Pfizer Pharma', cardiologyId, 'tablet', 'medicine', 18.50, 24.00, true, 'Cholesterol lowering medication', ['https://lh3.googleusercontent.com/aida-public/AB6AXuA1tPoEJ01V-0VllE4bDPbtx9Gb5ZcLdujLRMooZ_AgFgJn68twfprSkJ9lMnm9e-23ofkwsDfmTfUZZRDUpygpizpA3nCExe28mnyQtpkxklXWaBqV6zTSvQPevMcU_LNEgKUDYAu0Xly6bw46_ogQD-da1HE9Z7hslKGtAehPUWeaxF81LHdE8scvljjzs9RXa_uEN7qDsXxWNgW-TMwESO6TFiJ4GJ2sjJ1JFHzNsrT77qIP-Uo0qGP0pE1wXRe6gMiQcTIJ2T9j'],
      // Vitamin C
      'Vitamin C Complex', 'Cipla Clinical', wellnessId, 'tablet', 'wellness', 12.99, null, false, 'Immunity booster', ['https://lh3.googleusercontent.com/aida-public/AB6AXuCHsY5cA37TF4FJSaCbgpgXnz6_HhSSMvUdgdyid-2gyG4Z9FliPIXxqp-k3Dw2sRBMeLCgj7zKzPoNdj6ECAtQP93UZNOA7BD5UFAly66C64vTmrgZRDLjCeVN9IKXMmEGIuZcC-tLSqVxPF4Mo_4JeF9nDushmT1hok7TGg5xwdHysSokFXGo-_7434WsuBZP7l2np5CwqJSxntHbS5Kobj5R6naUQM5xUGJhf--KaarMmT54MMxbi_RFSC6IszGjBeObxMSBhK1C']
    ]);

    console.log('Seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    db.pool.end();
  }
}
seed();
