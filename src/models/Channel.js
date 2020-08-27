const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Channel = MySQL.define('channel', {
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
    url: {
        type: Sequelize.STRING,
        // unique: true,
        allowNull: true
    },
    desc_ru: {
        type: Sequelize.STRING,
    },
    desc_uz: {
        type: Sequelize.STRING,
    },
    is_channel: {
        type: Sequelize.INTEGER,
    },

}, {
    timestamps: true
});

module.exports = Channel;