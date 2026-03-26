const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MedicationReminder = sequelize.define(
  'MedicationReminder',
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
    medicationName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'medicine_name',
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reminderTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'reminder_time',
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    lastRemindedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_reminded_at',
    },
  },
  {
    tableName: 'medication_reminders',
    underscored: true,
  }
);

module.exports = MedicationReminder;
