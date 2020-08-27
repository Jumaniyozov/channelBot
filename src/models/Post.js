const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Post = MySQL.define('post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pubdate: {
        type: Sequelize.STRING

    },
    compName: {
        type: Sequelize.STRING,
    },
    contacts: {
        type: Sequelize.STRING,
    },
    compType: {
        type: Sequelize.STRING,
    },
    prodType: {
        type: Sequelize.STRING,
    },

}, {
    timestamps: true
});

module.exports = Post;