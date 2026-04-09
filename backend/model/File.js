const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const File = sequelize.define('File', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    file_path: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    file_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    original_name: {
        type: DataTypes.STRING,
        allowNull: true,
    }

}, {
    tableName: 'files',
    timestamps: true,
});


module.exports = File;