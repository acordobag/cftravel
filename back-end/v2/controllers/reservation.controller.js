import bcrypt from 'bcryptjs'
import Place from '../models/place.model'
import ReservationModel from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import UserModel from '../models/user.model'
import mailUtil from '../utils/mail.util'

const Reservation = {
    save: async (req, res, next) => {
      try {
        const shuttles = (req.body.shuttles || []).map(shuttle => {
            return {
                departingId: shuttle.departing.id,
                destinationId: shuttle.destination.id,
                date: shuttle.date,
                persons: shuttle.persons,
                rate: shuttle.rate,
                distance: shuttle.distance
            }
        });
        const reservation = {
            message: req.body.message,
            shuttles: shuttles
        }
        const user = await UserModel.findOne({ where: { email: req.body.user.email } });
        if (user) {
            reservation.userId = user.id;
            await Reservation.createReservation(reservation, res);
        } else if (!user) {
            req.body.user.password = Math.random().toString(36).slice(-8);
            req.body.user.password = bcrypt.hashSync(req.body.user.password, bcrypt.genSaltSync(8));
            const newUser = await UserModel.create(req.body.user);

            mailUtil.sendEmail(newUser.email, 'Si lees esto es porque todo salion bien we', 'Holi', async () => {
                reservation.userId = newUser.id;
                await Reservation.createReservation(reservation, res);
            });
        }
      } catch (e) {
        next(e)
      }
    },
    createReservation: async (reservation, res) => {
        const newReservation = await ReservationModel.create(reservation, { include: [{ model: Shuttle }] });
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


