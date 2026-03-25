require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const sequelize = require('../db');
const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  { name: 'Omeprazole 20mg', brand: "Dr. Reddy's", description: 'Reduces stomach acid for heartburn and ulcer relief', category: 'Gastro', price: 95, stock: 100, requiresPrescription: false, rating: 4.6, reviewCount: 345, tags: ['acid', 'heartburn'] },
  { name: 'Metformin 500mg', brand: 'Sun Pharma', description: 'Diabetes medication to control blood sugar levels', category: 'Diabetes', price: 125, stock: 80, requiresPrescription: true, rating: 4.7, reviewCount: 678, tags: ['diabetes'] },
  { name: 'Amoxicillin 500mg', brand: "Dr. Reddy's", description: 'Broad-spectrum antibiotic for various infections', category: 'Antibiotics', price: 165, stock: 0, requiresPrescription: true, rating: 4.5, reviewCount: 289, tags: ['antibiotic'] },
  { name: 'Paracetamol 500mg', brand: 'Cipla', description: 'Pain reliever and fever reducer', category: 'Pain Relief', price: 30, stock: 200, requiresPrescription: false, rating: 4.8, reviewCount: 1200, tags: ['fever', 'pain'] },
  { name: 'Cetirizine 10mg', brand: 'Mankind', description: 'Antihistamine for allergy relief', category: 'Allergy', price: 45, stock: 150, requiresPrescription: false, rating: 4.4, reviewCount: 430, tags: ['allergy'] },
  { name: 'Vitamin D3 5000 IU', brand: 'HealthKart', description: 'Dietary supplement for bone health', category: 'Supplements', price: 299, stock: 60, requiresPrescription: false, rating: 4.6, reviewCount: 890, tags: ['vitamin'] },
  { name: 'Lisinopril 10mg', brand: 'Lupin', description: 'ACE inhibitor for blood pressure control', category: 'Cardiology', price: 85, stock: 70, requiresPrescription: true, rating: 4.5, reviewCount: 320, tags: ['blood pressure'] },
  { name: 'Atorvastatin 20mg', brand: 'Pfizer', description: 'Statin for cholesterol management', category: 'Cardiology', price: 210, stock: 55, requiresPrescription: true, rating: 4.6, reviewCount: 510, tags: ['cholesterol'] },
  { name: 'Insulin Syringe 1ml', brand: 'BD', description: 'Sterile insulin syringe for diabetes management', category: 'Diabetes', price: 15, stock: 500, requiresPrescription: false, rating: 4.9, reviewCount: 2100, tags: ['insulin', 'syringe'] },
  { name: 'Alcohol Pads 70%', brand: 'Romsons', description: 'Sterile isopropyl alcohol swabs', category: 'First Aid', price: 50, stock: 300, requiresPrescription: false, rating: 4.7, reviewCount: 760, tags: ['alcohol', 'swab'] },
  { name: 'Azithromycin 500mg', brand: 'Cipla', description: 'Antibiotic for respiratory infections', category: 'Antibiotics', price: 180, stock: 40, requiresPrescription: true, rating: 4.5, reviewCount: 390, tags: ['antibiotic'] },
  { name: 'Pantoprazole 40mg', brand: 'Sun Pharma', description: 'Proton pump inhibitor for acid reflux', category: 'Gastro', price: 110, stock: 90, requiresPrescription: false, rating: 4.6, reviewCount: 450, tags: ['acid reflux'] },
];

async function seed() {
  console.log('--- STARTING SAFE RESTORATION ---');
  // SYNC WITHOUT FORCE: TRUE
  await sequelize.sync(); 
  console.log('Database synced (safely)');

  // Only create admin if not exists
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@meddelivery.com' },
    defaults: { name: 'Admin', password: 'admin123', role: 'admin' }
  });
  console.log('Admin account checked');

  const [retailerUser] = await User.findOrCreate({
    where: { email: 'retailer@meddelivery.com' },
    defaults: { name: 'MedStore Retailer', password: 'retailer123', role: 'retailer' }
  });
  console.log('Retailer user checked');

  // Ensure Retailer record exists
  const [retailers] = await sequelize.query(`SELECT id FROM retailers WHERE user_id = '${retailerUser.id}'`);
  let DEMO_RETAILER_ID;
  if (retailers.length === 0) {
    const [rows] = await sequelize.query(`
      INSERT INTO retailers (user_id, shop_name, drug_license, gstin, kyc_status)
      VALUES ('${retailerUser.id}', 'MedStore Pune', 'DL-12345', 'GST-999', 'approved')
      RETURNING id
    `);
    DEMO_RETAILER_ID = rows[0].id;
    console.log('Retailer record created');
  } else {
    DEMO_RETAILER_ID = retailers[0].id;
    console.log('Retailer record already exists');
  }

  // Restore baseline products
  console.log('Checking baseline products...');
  for (const p of products) {
    const [existing] = await sequelize.query(`SELECT id FROM products WHERE name = :name LIMIT 1`, {
      replacements: { name: p.name }
    });
    if (existing.length === 0) {
      await Product.create({ ...p, retailerId: DEMO_RETAILER_ID });
      console.log(`Restored: ${p.name}`);
    }
  }

  await sequelize.close();
  console.log('✅ Restoration complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });
