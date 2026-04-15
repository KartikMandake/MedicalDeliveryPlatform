const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OfflineSale = sequelize.define('OfflineSale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  retailer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'upi'),
    allowNull: false,
    defaultValue: 'cash',
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('completed', 'refunded'),
    allowNull: false,
    defaultValue: 'completed',
  },
}, {
  tableName: 'offline_sales',
  underscored: true,
});

module.exports = OfflineSale;
