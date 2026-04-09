const bcrypt = require('bcrypt');

const hashPassword = async(password) => {
    return await bcrypt.hash(password, 12);
};

const comparePassword = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8);
};

module.exports = { hashPassword, comparePassword, generateTemporaryPassword };