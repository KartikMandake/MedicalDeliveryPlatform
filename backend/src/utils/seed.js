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
  await sequelize.sync({ force: true });
  console.log('Tables created');

  const admin = await User.create({ name: 'Admin', email: 'admin@meddelivery.com', password: 'admin123', role: 'admin' });
  console.log('Admin: admin@meddelivery.com / admin123');

  const retailer = await User.create({ name: 'MedStore Retailer', email: 'retailer@meddelivery.com', password: 'retailer123', role: 'retailer' });
  console.log('Retailer: retailer@meddelivery.com / retailer123');

  await User.create({ name: 'Delivery Agent', email: 'agent@meddelivery.com', password: 'agent123', role: 'agent', phone: '+919999999999' });
  console.log('Agent: agent@meddelivery.com / agent123');

  await User.create({ name: 'Test User', email: 'user@meddelivery.com', password: 'user123', role: 'user' });
  console.log('User: user@meddelivery.com / user123');

  await Product.bulkCreate(products.map((p) => ({ ...p, retailerId: retailer.id })));
  console.log(`${products.length} products seeded`);

  await sequelize.close();
  console.log('✅ Seed complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });
