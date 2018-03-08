var Place = require('../models/place.model');
var Image = require('../models/image.model');

module.exports.save = function (req, res) {

    Place.create(req.body, {include: [{model: Image, as: 'images'}]}).then(function (place) {
        if (place) {
            res.send(place);
        } else if (!place) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" });
        }

    });
};

module.exports.findAll = function (req, res) {
    Place.findAll({include: [{model: Image, as: 'images'}]}).then(function (places) {
        if (places) {
            res.send(places);
        } else if (!places) {
            res.send({ status: 400, msj: "NO HAY NINGUN REGISTRO" });
        }
    });
};
//  
