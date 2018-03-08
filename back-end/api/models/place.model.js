var config = require('../config/database');
var Sequelize = require('sequelize');
var Image = require('./image.model');
var connection = config.database;

module.exports = Place = connection.define('place', {
    name: Sequelize.STRING,
    description: Sequelize.TEXT
});

Place.hasMany(Image, {as:'images'});

connection.sync();