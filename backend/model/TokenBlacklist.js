const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'token_blacklist',
    timestamps: true,
});

module.exports = TokenBlacklist;