const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  requiresPrescription: { type: DataTypes.BOOLEAN, defaultValue: false },
  image: DataTypes.STRING,
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  retailerId: { type: DataTypes.UUID },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
}, { tableName: 'products' });

module.exports = Product;
