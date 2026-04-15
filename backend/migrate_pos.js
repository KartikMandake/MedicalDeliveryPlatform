require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:KCFdODEYKlCgjsNaxxYSVRczVmLfxSyJ@caboose.proxy.rlwy.net:41485/railway';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS offline_sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        retailer_id UUID NOT NULL,
        total_amount FLOAT NOT NULL DEFAULT 0,
        payment_method VARCHAR(10) NOT NULL DEFAULT 'cash',
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ offline_sales table ready');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS offline_sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_id UUID NOT NULL REFERENCES offline_sales(id) ON DELETE CASCADE,
        inventory_id UUID NOT NULL,
        medicine_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price FLOAT NOT NULL DEFAULT 0,
        subtotal FLOAT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ offline_sale_items table ready');

    console.log('\n🎉 POS tables created successfully! The feature is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
