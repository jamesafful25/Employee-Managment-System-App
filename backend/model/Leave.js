const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Leave = sequelize.define('Leave', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_days: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = Leave;