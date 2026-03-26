const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.STRING(50),
      unique: true,
      field: 'order_number',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    retailerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'retailer_id',
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'agent_id',
    },
    status: {
      type: DataTypes.ENUM('placed', 'confirmed', 'packing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: true,
      defaultValue: 'placed',
    },
    deliveryAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'delivery_address',
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    deliveryFee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      field: 'delivery_fee',
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'total_amount',
    },
    pickupOtp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: 'pickup_otp',
    },
    deliveryOtp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: 'delivery_otp',
    },
    prescriptionUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'prescription_url',
    },
    razorpayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'razorpay_order_id',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
      allowNull: true,
      defaultValue: 'pending',
      field: 'payment_status',
    },
    placedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'placed_at',
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at',
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: false,
    underscored: true,
  }
);

module.exports = Order;
