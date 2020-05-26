var config = require('../config/database');
var Sequelize = require('sequelize');
var connection = config.database;
var Phone = require ('./phone.model');

module.exports = Comapny = connection.define('company',{
    name : Sequelize.STRING,
    email : Sequelize.STRING
  });

Comapny.hasMany(Phone, {as: 'phones'});

connection.sync();