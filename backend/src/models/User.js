const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: true, field: 'password_hash' },
  phone: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  address: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  role: { type: DataTypes.ENUM('user', 'retailer', 'agent', 'admin'), defaultValue: 'user' },
  status: { type: DataTypes.ENUM('active', 'suspended', 'pending_kyc'), defaultValue: 'active' },
  fcmToken: { type: DataTypes.TEXT, field: 'fcm_token' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, { tableName: 'users', timestamps: false });

User.beforeCreate(async (user) => {
  if (user.password) user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
