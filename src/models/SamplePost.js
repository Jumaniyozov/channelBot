const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const SamplePost = MySQL.define('samplepost', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    media: {
        type: Sequelize.STRING,
        // unique: true,
        allowNull: true
    },
    mediaType: {
        type: Sequelize.STRING,
        // unique: true,
        allowNull: true
    },
    header: {
        type: Sequelize.STRING,
        // unique: true,
        allowNull: true
    },
    pubdate: {
        type: Sequelize.STRING,
        allowNull: true
    },
    caption: {
        type: Sequelize.STRING,
        allowNull: true
    },
    contacts: {
        type: Sequelize.STRING,
        allowNull: true
    },
    channelname: {
        type: Sequelize.STRING,

    }

}, {
    timestamps: true
});

module.exports = SamplePost;