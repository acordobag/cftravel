var config = require('../config/database');
var Sequelize = require('sequelize');
var User = require('./user.model');
var Shuttle = require('./shuttle.model');
var connection = config.database;;

Reservation = connection.define('reservation', {
    message: Sequelize.STRING
});

Reservation.belongsTo(User, {as: 'user'});
Reservation.hasMany(Shuttle,{as: 'shuttles'});

module.exports = Reservation;

connection.sync();