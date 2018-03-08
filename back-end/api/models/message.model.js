var config = require('../config/database');
var Sequelize = require('sequelize');
var connection = config.database;


module.exports = Message = connection.define('Message', {
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    text: Sequelize.STRING

});


connection.sync();