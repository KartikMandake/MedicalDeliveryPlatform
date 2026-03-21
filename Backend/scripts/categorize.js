require('dotenv').config({ path: '../.env' });
const db = require('../src/config/db');

const categories = [
  { name: 'Diabetes', icon_url: 'blood_sugar', regex: /diabet|sugar|insulin|glimepiride|metformin/i },
  { name: 'Blood Pressure', icon_url: 'blood_pressure', regex: /blood pressure|hypertension|bp|amlodipine|losartan|telmisartan/i },
  { name: 'Skin Disease', icon_url: 'dermatology', regex: /skin|acne|fungal|cream|ointment|itching|eczema|derma|lotion/i },
  { name: 'Pain Relief', icon_url: 'healing', regex: /pain|fever|headache|paracetamol|inflammation|diclofenac|ibuprofen|analgesic/i },
  { name: 'Antibiotics', icon_url: 'medication', regex: /bacterial|antibiotic|infection|amoxicillin|azithromycin|cefixime/i },
  { name: 'Vitamins & Supplements', icon_url: 'water_drop', regex: /vitamin|calcium|mineral|immunity|supplement|d3|b12|zinc|iron/i },
  { name: 'Heart Care', icon_url: 'monitor_heart', regex: /heart|cardiac|cholesterol|atorvastatin|rosuvastatin/i },
  { name: 'Digestive Care', icon_url: 'local_pharmacy', regex: /digestion|acidity|gas|ulcer|pantoprazole|vomiting|stomach|constipation|rabeprazole|omeprazole/i },
  { name: 'General Medicine', icon_url: 'medical_services', regex: /.*/i } // Fallback
];

async function main() {
  try {
    console.log('Starting optimized categorization process...');

    await db.query('UPDATE medicines SET category_id = NULL');
    await db.query('DELETE FROM categories');
    
    const categoryMap = {}; 
    for (const cat of categories) {
      const res = await db.query(
        'INSERT INTO categories (name, icon_url) VALUES ($1, $2) RETURNING id, name',
        [cat.name, cat.icon_url]
      );
      categoryMap[res.rows[0].name] = res.rows[0].id;
    }
    console.log('Created categories');

    const medicinesRes = await db.query('SELECT id, name, description FROM medicines');
    const medicines = medicinesRes.rows;

    const values = [];
    const queryParams = [];
    let paramIndex = 1;

    for (const med of medicines) {
      const textToSearch = `${med.name} ${med.description || ''}`;
      let assignedCategory = 'General Medicine';

      for (const cat of categories) {
        if (cat.name !== 'General Medicine' && cat.regex.test(textToSearch)) {
          assignedCategory = cat.name;
          break;
        }
      }

      const categoryId = categoryMap[assignedCategory];
      
      // Add to bulk values
      values.push(`($${paramIndex}::uuid, $${paramIndex+1}::uuid)`);
      queryParams.push(med.id, categoryId);
      paramIndex += 2;
    }

    if (values.length > 0) {
      const updateQuery = `
        UPDATE medicines AS m
        SET category_id = v.category_id
        FROM (VALUES ${values.join(',')}) AS v(id, category_id)
        WHERE m.id = v.id
      `;
      await db.query(updateQuery, queryParams);
      console.log(`Successfully batch categorized ${medicines.length} medicines.`);
    }

  } catch (err) {
    console.error('Error during categorization:', err);
  } finally {
    process.exit(0);
  }
}

main();
