'use strict'

import bcrypt from 'bcryptjs'
import Place from '../models/place.model'
import ReservationModel from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import UserModel from '../models/user.model'
import Mail from '../utils/mail.util'

const reservationInclude = [
  {
    model: Shuttle,
    include: [
      { model: Place, as: 'departing' },
      { model: Place, as: 'destination' }
    ]
  }
]

const Reservation = {
  save: async (req, res, next) => {
    try {
      const shuttles = (req.body.shuttles || []).map(shuttle => ({
        departingId: shuttle.departing.id,
        destinationId: shuttle.destination.id,
        date: shuttle.date,
        persons: shuttle.persons,
        rate: shuttle.rate,
        distance: shuttle.distance
      }))

      const reservationData = {
        message: req.body.message,
        shuttles
      }

      let user = await UserModel.findOne({ where: { email: req.body.user.email } })

      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-8)
        user = await UserModel.create({
          name: req.body.user.name,
          lastName: req.body.user.lastName,
          email: req.body.user.email,
          phone: req.body.user.phone || '',
          password: bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(8)),
          role: 'USER',
          active: true,
          token: '',
          emailVerified: true,
          mustChangePassword: true
        })
        Mail.guestAccountCreated(user, tempPassword).catch(() => {})
      }

      reservationData.userId = user.id
      await Reservation.createReservation(reservationData, user, res)
    } catch (e) {
      next(e)
    }
  },

  createReservation: async (data, user, res) => {
    const newReservation = await ReservationModel.create(data, { include: [{ model: Shuttle }] })
    if (!newReservation) {
      return res.status(400).json({ message: 'Reservation could not be created.' })
    }

    const full = await ReservationModel.findOne({ where: { id: newReservation.id }, include: reservationInclude })

    Mail.reservationConfirmedCustomer(full, user).catch(() => {})
    Mail.reservationNotifyCompany(full, user).catch(() => {})

    res.status(201).json(full)
  }
}

module.exports = Reservation
