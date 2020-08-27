const Sequelize = require('sequelize');
const config = require('../../config.json');
class MySQL {
	constructor(host, login, password, basename) {
		this.connection = new Sequelize(basename, login, password, {
			host: host,
			dialect: 'mysql',
			define: {
				timestamps: false
			},
		});
	}
}
const mysql = new MySQL(config.host, config.username, config.password, config.basename)
module.exports = mysql.connection;