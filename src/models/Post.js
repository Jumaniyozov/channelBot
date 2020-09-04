const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Post = MySQL.define('post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    companyName: {
        type: Sequelize.STRING,
    },
    companyContacts: {
        type: Sequelize.STRING,
    },
    companyAuditory: {
        type: Sequelize.STRING,
    },
    companyAuditoryAge: {
        type: Sequelize.STRING,
    },
    companyStartPub: {
        type: Sequelize.STRING,
    },
    companyEndPub: {
        type: Sequelize.STRING,
    },

}, {
    timestamps: true
});

module.exports = Post;