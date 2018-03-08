var config = require('../config/database');
var Sequelize = require('sequelize');
var connection = config.database;
var Company = require('./company.model');

module.exports = Phone = connection.define('phone', {
    code: Sequelize.STRING,
    number: Sequelize.STRING
});

connection.sync();