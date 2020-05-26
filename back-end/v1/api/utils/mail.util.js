var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adriak1003@gmail.com',
        pass: 'Castillo1097'
    }
});

module.exports.sendEmail = function (email,message, subject, callback) {
    var mailOptions = {
        from: 'service@guaymi.com',
        to: email,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        	callback();
    });
}