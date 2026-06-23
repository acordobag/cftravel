import express from 'express'

import Place from '../controllers/place.controller';
import Reservation from '../controllers/reservation.controller';
import Testimonial from '../controllers/testimonial.controller';
import HeroImage from '../controllers/hero-image.controller';
import Auth from '../controllers/auth.controller';
import AdminMaintenance from '../controllers/admin-maintenance.controller';
import Upload from '../controllers/upload.controller';
import Pricing from '../controllers/pricing.controller';
import CarTypeController from '../controllers/car-type.controller';
import Account from '../controllers/account.controller';
import { requireAuth, requirePrivileged, requireSuper } from '../middleware/auth.middleware';

const router = express.Router()

router.param('id', function (req, res, next, id) {
    req.body = req.body || {};
    req.body.id = id;
    next();
});

// Auth routes

router.route('/auth/signup')
    .post(function (req, res, next) {
        Auth.signup(req, res, next);
    });

router.route('/auth/login')
    .post(function (req, res, next) {
        Auth.login(req, res, next);
    });

router.route('/auth/verify-email')
    .post(function (req, res, next) {
        Auth.verifyEmail(req, res, next);
    });

router.route('/auth/change-password')
    .post(requireAuth, function (req, res, next) {
        Auth.changePassword(req, res, next);
    });

router.route('/auth/me')
    .get(requireAuth, function (req, res) {
        Auth.me(req, res);
    });

// Public content routes

router.route('/place')
    .get(function (req, res, next) {
        Place.findAll(req, res, next);
    });

router.route('/hero-image')
    .get(function (req, res, next) {
        HeroImage.findAll(req, res, next);
    });

router.route('/testimonial')
    .get(function (req, res, next) {
        Testimonial.findAll(req, res, next);
    })
    .post(requireAuth, function (req, res, next) {
        Testimonial.submitReview(req, res, next);
    });

router.route('/pricing')
    .get(function (req, res, next) {
        Pricing.publicConfig(req, res, next);
    });

router.route('/company')
    .get(function (req, res, next) {
        AdminMaintenance.findDefaultCompany(req, res, next);
    });

router.route('/account/profile')
    .get(requireAuth, function (req, res, next) {
        Account.profile(req, res, next);
    })
    .put(requireAuth, function (req, res, next) {
        Account.updateProfile(req, res, next);
    });

router.route('/account/reservations')
    .get(requireAuth, function (req, res, next) {
        Account.reservations(req, res, next);
    });

router.route('/account/messages')
    .get(requireAuth, function (req, res, next) {
        Account.messages(req, res, next);
    });

// Admin maintenance routes

router.route('/admin/place')
    .get(requirePrivileged, function (req, res, next) {
        Place.findAll(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        Place.save(req, res, next);
    });

router.route('/admin/place/:id')
    .put(requirePrivileged, function (req, res, next) {
        Place.update(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        Place.delete(req, res, next);
    });

router.route('/admin/testimonial')
    .get(requirePrivileged, function (req, res, next) {
        Testimonial.findAllAdmin(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        Testimonial.save(req, res, next);
    });

router.route('/admin/testimonial/:id')
    .put(requirePrivileged, function (req, res, next) {
        Testimonial.update(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        Testimonial.delete(req, res, next);
    });

router.route('/admin/hero-image')
    .get(requirePrivileged, function (req, res, next) {
        HeroImage.findAll(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        HeroImage.save(req, res, next);
    });

router.route('/admin/hero-image/:id')
    .put(requirePrivileged, function (req, res, next) {
        HeroImage.update(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        HeroImage.delete(req, res, next);
    });

router.route('/admin/upload-image')
    .post(requirePrivileged, function (req, res, next) {
        Upload.image(req, res, next);
    });

router.route('/admin/pricing')
    .get(requirePrivileged, function (req, res, next) {
        Pricing.adminConfig(req, res, next);
    });

router.route('/admin/pricing/rule')
    .post(requirePrivileged, function (req, res, next) {
        Pricing.createRule(req, res, next);
    });

router.route('/admin/pricing/rule/:id')
    .put(requirePrivileged, function (req, res, next) {
        Pricing.updateRule(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        Pricing.deleteRule(req, res, next);
    });

router.route('/admin/pricing/fixed-route')
    .post(requirePrivileged, function (req, res, next) {
        Pricing.createFixedRoute(req, res, next);
    });

router.route('/admin/pricing/fixed-route/:id')
    .put(requirePrivileged, function (req, res, next) {
        Pricing.updateFixedRoute(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        Pricing.deleteFixedRoute(req, res, next);
    });

router.route('/admin/pricing/service-rule')
    .post(requirePrivileged, function (req, res, next) {
        Pricing.createServiceRule(req, res, next);
    });

router.route('/admin/pricing/service-rule/:id')
    .put(requirePrivileged, function (req, res, next) {
        Pricing.updateServiceRule(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        Pricing.deleteServiceRule(req, res, next);
    });

router.route('/admin/car-type')
    .get(requirePrivileged, function (req, res, next) {
        CarTypeController.findAllAdmin(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        CarTypeController.create(req, res, next);
    });

router.route('/admin/car-type/:id')
    .put(requirePrivileged, function (req, res, next) {
        CarTypeController.update(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        CarTypeController.delete(req, res, next);
    });

router.route('/admin/reservation')
    .get(requirePrivileged, function (req, res, next) {
        AdminMaintenance.findReservations(req, res, next);
    });

router.route('/admin/reservation/:id')
    .put(requirePrivileged, function (req, res, next) {
        AdminMaintenance.updateReservation(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        AdminMaintenance.deleteReservation(req, res, next);
    });

router.route('/admin/shuttle/:id')
    .put(requirePrivileged, function (req, res, next) {
        AdminMaintenance.updateShuttle(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        AdminMaintenance.deleteShuttle(req, res, next);
    });

router.route('/admin/company')
    .get(requirePrivileged, function (req, res, next) {
        AdminMaintenance.findCompanies(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        AdminMaintenance.createCompany(req, res, next);
    });

router.route('/admin/company/:id')
    .put(requirePrivileged, function (req, res, next) {
        AdminMaintenance.updateCompany(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        AdminMaintenance.deleteCompany(req, res, next);
    });

router.route('/admin/phone')
    .post(requirePrivileged, function (req, res, next) {
        AdminMaintenance.createPhone(req, res, next);
    });

router.route('/admin/phone/:id')
    .put(requirePrivileged, function (req, res, next) {
        AdminMaintenance.updatePhone(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        AdminMaintenance.deletePhone(req, res, next);
    });

router.route('/admin/message')
    .get(requirePrivileged, function (req, res, next) {
        AdminMaintenance.findMessages(req, res, next);
    })
    .post(requirePrivileged, function (req, res, next) {
        AdminMaintenance.createMessage(req, res, next);
    });

router.route('/admin/message/:id')
    .put(requirePrivileged, function (req, res, next) {
        AdminMaintenance.updateMessage(req, res, next);
    })
    .delete(requirePrivileged, function (req, res, next) {
        AdminMaintenance.deleteMessage(req, res, next);
    });

router.route('/admin/users')
    .get(requireSuper, function (req, res, next) {
        Auth.findAll(req, res, next);
    })
    .post(requireSuper, function (req, res, next) {
        Auth.createPrivileged(req, res, next);
    });

router.route('/admin/users/:id')
    .put(requireSuper, function (req, res, next) {
        Auth.updateUser(req, res, next);
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
    .post((req, res, next) => {
        Reservation.save(req, res, next);
    });


// router.route('/cars/:id')
//     .get((req, res) => {
//         Shuttle.findById(req, res);
//     });

module.exports = router;
