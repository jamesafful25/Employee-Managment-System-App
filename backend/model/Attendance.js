const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    clock_in: { type: DataTypes.DATE, allowNull: false },
    clock_out: { type: DataTypes.DATE, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'), defaultValue: 'present' },
    hours_worked: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
    },
});

module.exports = Attendance;