const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payroll = sequelize.define('Payroll', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    basic_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tax_method: {
        type: DataTypes.ENUM('basic', 'gross'),
        defaultValue: 'basic',
    },
    net_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' },
    paid_at: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Payroll;