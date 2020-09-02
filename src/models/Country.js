const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Country = MySQL.define('country', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        // allowNull: true
    },
    locale: {
        type: Sequelize.STRING
    }, language: {
        type: Sequelize.STRING
    }
}, {
    timestamps: true
});

module.exports = Country;