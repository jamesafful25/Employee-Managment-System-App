const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Performance = sequelize.define('Performance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    reviewed_by: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    goals: { type: DataTypes.TEXT, allowNull: true },
    comments: { type: DataTypes.TEXT, allowNull: true },
    review_date: { type: DataTypes.DATEONLY, allowNull: false },
});

module.exports = Performance;