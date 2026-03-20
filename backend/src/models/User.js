const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('user', 'retailer', 'agent', 'admin'), defaultValue: 'user' },
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  pincode: DataTypes.STRING,
  lat: DataTypes.FLOAT,
  lng: DataTypes.FLOAT,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users' });

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
