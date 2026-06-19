import express from 'express'

import Place from '../controllers/place.controller';
import Reservation from '../controllers/reservation.controller';
import Testimonial from '../controllers/testimonial.controller';
import HeroImage from '../controllers/hero-image.controller';

const router = express.Router()

router.param('id', function (req, res, next, id) {
    req.body.id = id;
    next();
});

//Place routes

router.route('/place')
    .get(function (req, res, next) {
        Place.findAll(req, res, next);
    })
    .post(function (req, res, next) {
        Place.save(req, res, next)
    });

router.route('/hero-image')
    .get(function (req, res, next) {
        HeroImage.findAll(req, res, next);
    });

router.route('/testimonial')
    .get(function (req, res, next) {
        Testimonial.findAll(req, res, next);
    })
    .post(function (req, res, next) {
        Testimonial.save(req, res, next);
    });

//Shuttle routes

// router.route('/shuttle')
//     .get(function (req, res) {
//         Shuttle.findAll(req, res);
//     })
//     .post(function (req, res) {
//         Shuttle.save(req, res)
//     });

// //User routes

// router.route('/user')
//     .post(function (req, res) {
//         User.save(req, res)
//     });
// router.route('/auth')
//     .post(function (req, res) {
//         User.authenticate(req, res);
//     });

// //Reservation routes

router.route('/reservation')
    .post((req, res) => {
        Reservation.save(req, res);
    });


// router.route('/cars/:id')
//     .get((req, res) => {
//         Shuttle.findById(req, res);
//     });

module.exports = router;
