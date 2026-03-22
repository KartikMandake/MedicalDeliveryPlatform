const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AgentLocation = sequelize.define('AgentLocation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  agentId: { type: DataTypes.UUID, allowNull: false, unique: true },
  lat: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  lng: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  currentOrderId: DataTypes.UUID,
}, { tableName: 'agent_locations' });

module.exports = AgentLocation;
