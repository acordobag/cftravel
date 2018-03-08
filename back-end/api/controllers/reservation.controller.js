var Shuttle = require('../models/shuttle.model');
var User = require('../models/user.model');
var ShuttleController = require('../controllers/shuttle.controller');
var ReservationModel = require('../models/reservation.model');
var mailUtil= require('../utils/mail.util');

module.exports.save = function (req, res) {
    var shuttles = [];
    req.body.shuttles.forEach(shuttle => {
        shuttles.push({
            departingId: shuttle.departing.id,
            destinationId: shuttle.destination.id,
            date: shuttle.date,
            persons: shuttle.persons
        });
    });
    var reservation = {
        message: req.body.message,
        shuttles: shuttles
    }
    User.find({ where: { email: req.body.user.email } }).then(function (user) {
        if (user) {
            reservation.userId = user.id;
            createReservation(reservation, shuttles, res);
        } else if (!user) {
            req.body.user.password = Math.random().toString(36).slice(-8);
            User.create(req.body.user)
                .then(function (user) {
                    mailUtil.sendEmail(user.email,'Si lees esto es porque todo salion bien we', 'Holi', function(){

                    });
                    reservation.userId = user.id;
                    createReservation(reservation, shuttles, res);
                });
        }
    });

};

function createReservation(reservation, shuttles, res) {
    ReservationModel.create(reservation, { include: [{ model: Shuttle, as: 'shuttles' }] }).then(function (preservation) {
        if (preservation) {
            res.send(preservation);
        } else if (!reservation) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" });
        }

    });
}

module.exports.findAll = function (req, res) {
    Place.findAll().then(function (places) {
        if (places) {
            res.send(places);
        } else if (!places) {
            res.send({ status: 400, msj: "NO HAY NINGUN REGISTRO" });
        }
    });
};

