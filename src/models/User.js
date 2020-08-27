const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const User = MySQL.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        unique: true,
    },
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    lastName: {
        type: Sequelize.STRING,
    },
    firstName: {
        type: Sequelize.STRING,
    },
    language: {
        type: Sequelize.STRING,
    },
    phone: {
        type: Sequelize.STRING,
    },
}, {
    timestamps: true
});

module.exports = User;