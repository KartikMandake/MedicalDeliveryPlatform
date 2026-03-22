const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserAddress = sequelize.define('UserAddress', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  label: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Home' },
  fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
  phone: { type: DataTypes.STRING, allowNull: false },
  line1: { type: DataTypes.STRING, allowNull: false, field: 'line_1' },
  line2: { type: DataTypes.STRING, allowNull: true, field: 'line_2' },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  lat: { type: DataTypes.DOUBLE, allowNull: true },
  lng: { type: DataTypes.DOUBLE, allowNull: true },
  landmark: { type: DataTypes.STRING, allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
}, {
  tableName: 'user_addresses',
  timestamps: true,
});

module.exports = UserAddress;
