const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  items: { type: DataTypes.JSONB, defaultValue: [] },
  prescription: DataTypes.STRING,
}, { tableName: 'carts' });

module.exports = Cart;
