var express = require('express');
var router = express.Router();
var Place = require('../controllers/place.controller');
var Shuttle = require('../controllers/shuttle.controller');
var User = require('../controllers/user.controller');
var Reservation = require('../controllers/reservation.controller');

router.param('id', function (req, res, next, id) {
    req.body.id = id;
    next();
});

//Place routes

router.route('/place')
    .get(function (req, res) {
        Place.findAll(req, res);
    })
    .post(function (req, res) {
        Place.save(req, res)
    });

//Shuttle routes

router.route('/shuttle')
    .get(function (req, res) {
        Shuttle.findAll(req, res);
    })
    .post(function (req, res) {
        Shuttle.save(req, res)
    });

//User routes

router.route('/user')
    .post(function (req, res) {
        User.save(req, res)
    });
router.route('/auth')
    .post(function (req, res) {
        User.authenticate(req, res);
    });

//Reservation routes

router.route('/reservation')
    .post(function (req, res) {
        Reservation.save(req, res);
    });


// router.route('/cars/:id')
//     .get(function (req, res) {
//         Shuttle.findById(req, res);
//     });

module.exports = router;
