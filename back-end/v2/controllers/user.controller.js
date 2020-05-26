var User = require('../models/user.model.js');
var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcryptjs');

module.exports.save = function (req, res) {

    var pass = '';
    if (req.body.password) {
        pass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    }

    var user = {
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        password: pass,
        token: ''
    };

    User.create(user).then(function (puser) {
        if (puser) {
            res.send(user);
        } else if (!puser) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" })
        }
    });

};

module.exports.authenticate = function (req, res) {
    User.find({
        where: {
            email: req.body.email
        }
    }).then(function (user) {
        if (!user) {
            return res.send({ status: 400, success: false, msg: 'Correo incorrecto.' });
        } else {
            var isMatch = bcrypt.compareSync(req.body.password, user.password);
            if (isMatch) {
                if (user.status) {
                    var token = jwt.encode(user, config.secret);
                    user.token = 'JWT ' + token;
                    user.password = '';
                    res.send(user);
                } else {
                }
            } else {
            }
        }
    });
};
