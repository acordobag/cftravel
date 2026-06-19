const Shuttle = require('../models/shuttle.model');
const ReservationModel = require('../models/reservation.model');
const UserModel = require('../models/user.model');
const mailUtil = require('../utils/mail.util');

const Reservation = {
    save: async (req, res) => {
        const shuttles = req.body.shuttles.map(shuttle => {
            return {
                departingId: shuttle.departing.id,
                destinationId: shuttle.destination.id,
                date: shuttle.date,
                persons: shuttle.persons
            }
        });
        const reservation = {
            message: req.body.message,
            shuttles: shuttles
        }
        const user = await UserModel.findOne({ where: { email: req.body.user.email } });
        if (user) {
            reservation.userId = user.id;
            await createReservation(reservation, res);
        } else if (!user) {
            req.body.user.password = Math.random().toString(36).slice(-8);
            const newUser = await UserModel.create(req.body.user);

            mailUtil.sendEmail(newUser.email, 'Si lees esto es porque todo salion bien we', 'Holi', async () => {
                reservation.userId = newUser.id;
                await createReservation(reservation, res);
            });
        }
    },
    createReservation: async (reservation, res) => {
        const newReservation = await ReservationModel.create(reservation, { include: [{ model: Shuttle, as: 'shuttles' }] });
        if (newReservation) {
            res.send(newReservation);
        } else if (!newReservation) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" });
        }
    },
    findAll: async (req, res) => {
        const places = await Place.findAll();
        if (places) {
            res.send(places);
        } else if (!places) {
            res.send({ status: 400, msj: "NO HAY NINGUN REGISTRO" });
        }
    }
}

module.exports = Reservation


