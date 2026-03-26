const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MediBotMessage = sequelize.define(
  'MediBotMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: 'en',
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'medibot_messages',
    underscored: true,
  }
);

module.exports = MediBotMessage;
