var Shuttle = require('../models/shuttle.model');
var Place = require('../models/place.model');

module.exports.save = function (req, res) {
    createShuttle(req.body).then(function (shuttle) {
        if (shuttle) {
            res.send(shuttle);
        } else if (!shuttle) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" });
        }

    });
};

module.exports.createShuttle = function (pShuttle) {
    var shuttle = {
        date: pShuttle.date,
        persons: pShuttle.persons
    };

    var departing = pShuttle.departing;
    var destination = pShuttle.destination;

    Shuttle.create({
        date: shuttle.date,
        persons: shuttle.persons,
        departingId: departing.id,
        destinationId: destination.id
    });
}

module.exports.findAll = function (req, res) {
    Shuttle.findAll({ include: [{ model: Place, as: 'departing' }, { model: Place, as: 'destination' }] }).then(function (shuttles) {
        if (shuttles) {
            res.send(shuttles);
        } else if (!shuttles) {
            res.send({ status: 400, msj: "NO HAY NINGUN REGISTRO" });
        }
    });
};


