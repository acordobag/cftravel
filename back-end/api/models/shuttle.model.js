var config = require('../config/database');
var Sequelize = require('sequelize');
var Place = require('./place.model');
var connection = config.database;;

Shuttle = connection.define('shuttle', {
    date: Sequelize.DATE,
    persons: Sequelize.INTEGER
});

Shuttle.belongsTo(Place, {as: 'departing'});
Shuttle.belongsTo(Place, {as: 'destination'});
// Shuttle.belongsTo(Reservation, {as: 'reservation'})

module.exports = Shuttle;

connection.sync();