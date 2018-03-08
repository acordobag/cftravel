var config = require('../config/database');
var Sequelize = require('sequelize');
var connection = config.database;

module.exports = connection.define('user', {
    name: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: { type: Sequelize.STRING, unique: 'mailIndex' },
    password: Sequelize.STRING,
    token: Sequelize.STRING,
    phone: Sequelize.STRING
});
connection.sync();