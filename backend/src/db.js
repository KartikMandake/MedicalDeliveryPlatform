const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:KCFdODEYKlCgjsNaxxYSVRczVmLfxSyJ@caboose.proxy.rlwy.net:41485/railway';
const shouldUseSsl = process.env.DB_SSL === 'true' || /sslmode=require/i.test(databaseUrl);

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: shouldUseSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;
