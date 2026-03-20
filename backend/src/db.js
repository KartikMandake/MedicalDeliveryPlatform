const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medicaldelivery', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ssl')
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;
