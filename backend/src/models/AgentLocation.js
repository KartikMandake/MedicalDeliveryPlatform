const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AgentLocation = sequelize.define(
  'AgentLocation',
  {
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: 'agent_id',
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_online',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
    currentOrderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'current_order_id',
    },
  },
  {
    tableName: 'agent_locations',
    timestamps: false,
    underscored: true,
  }
);

module.exports = AgentLocation;
