const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OfflineSaleItem = sequelize.define('OfflineSaleItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sale_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  inventory_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  medicine_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'offline_sale_items',
  underscored: true,
});

module.exports = OfflineSaleItem;
