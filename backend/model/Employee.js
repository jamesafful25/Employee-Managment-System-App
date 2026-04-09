const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    google_id: { type: DataTypes.STRING, allowNull: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'hr', 'manager', 'employee'), defaultValue: 'employee' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    hire_date: { type: DataTypes.DATE, allowNull: true },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    is_password_changed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

module.exports = Employee;