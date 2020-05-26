var config = require('../config/database');
var Sequelize = require('sequelize');
var connection = config.database;

module.exports = Image = connection.define('image',{
    src : Sequelize.STRING
  });

connection.sync();