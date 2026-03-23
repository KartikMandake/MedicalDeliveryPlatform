const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  retailerId: DataTypes.UUID,
  agentId: DataTypes.UUID,
  items: { type: DataTypes.JSONB, defaultValue: [] },
  subtotal: DataTypes.FLOAT,
  deliveryFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  taxes: DataTypes.FLOAT,
  total: DataTypes.FLOAT,
  status: {
    type: DataTypes.ENUM('pending','confirmed','preparing','ready_for_pickup','in_transit','delivered','cancelled'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending','paid','failed','refunded'),
    defaultValue: 'pending',
  },
  paymentId: DataTypes.STRING,
  razorpayOrderId: DataTypes.STRING,
  deliveryStreet: DataTypes.STRING,
  deliveryCity: DataTypes.STRING,
  deliveryState: DataTypes.STRING,
  deliveryPincode: DataTypes.STRING,
  deliveryLat: DataTypes.FLOAT,
  deliveryLng: DataTypes.FLOAT,
  prescription: DataTypes.STRING,
  pickupOtp: DataTypes.STRING,
  deliveryOtp: DataTypes.STRING,
  pickupOtpVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  deliveryOtpVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  estimatedDelivery: DataTypes.DATE,
  deliveredAt: DataTypes.DATE,
}, { tableName: 'orders' });

module.exports = Order;
