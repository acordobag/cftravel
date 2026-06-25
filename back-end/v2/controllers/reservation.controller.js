'use strict'

import bcrypt from 'bcryptjs'
import Place from '../models/place.model'
import ReservationModel from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import UserModel from '../models/user.model'
import BookingPolicy from '../models/booking-policy.model'
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
        distance: shuttle.distance,
        infantCount: shuttle.infantCount || 0,
        toddlerCount: shuttle.toddlerCount || 0,
        preschoolCount: shuttle.preschoolCount || 0,
        childCount: shuttle.childCount || 0
      }))

      const reservationData = {
        message: req.body.message,
        shuttles
      }

      let user = await UserModel.findOne({ where: { email: req.body.user.email } })
      let tempPassword = null

      if (!user) {
        tempPassword = Math.random().toString(36).slice(-8)
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
      }

      reservationData.userId = user.id
      await Reservation.createReservation(reservationData, user, res, tempPassword)
    } catch (e) {
      next(e)
    }
  },

  createReservation: async (data, user, res, tempPassword) => {
    const newReservation = await ReservationModel.create(data, { include: [{ model: Shuttle }] })
    if (!newReservation) {
      return res.status(400).json({ message: 'Reservation could not be created.' })
    }

    const full = await ReservationModel.findOne({ where: { id: newReservation.id }, include: reservationInclude })

    if (tempPassword) {
      Mail.guestAccountCreated(user, tempPassword, full).catch(() => {})
    } else {
      Mail.reservationConfirmedCustomer(full, user).catch(() => {})
    }
    Mail.reservationNotifyCompany(full, user).catch(() => {})

    res.status(201).json(full)
  },

  cancel: async (req, res, next) => {
    try {
      const userId = req.user.id
      const reservation = await ReservationModel.findOne({
        where: { id: req.params.id, userId: userId },
        include: reservationInclude
      })
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' })
      }

      const policy = await BookingPolicy.findOne({ where: { isDefault: true } })
      const minHours = (policy && policy.minHoursCancel) || 48
      const feePercent = (policy && policy.cancelFeePercent) || 50

      const firstShuttle = reservation.shuttles && reservation.shuttles[0]
      if (!firstShuttle || !firstShuttle.date) {
        return res.status(400).json({ message: 'No shuttle date found.' })
      }

      const hoursUntil = (new Date(firstShuttle.date) - new Date()) / 3600000
      if (hoursUntil < minHours) {
        return res.status(400).json({ message: 'Cancellation is not allowed within ' + minHours + ' hours of the reservation.' })
      }

      const total = reservation.shuttles.reduce(function (sum, s) { return sum + (s.rate || 0) }, 0)
      const fee = Number((total * feePercent / 100).toFixed(2))

      await ReservationModel.update({ status: 'cancelled' }, { where: { id: reservation.id } })

      res.status(200).json({ success: true, fee: fee, feePercent: feePercent })
    } catch (e) {
      next(e)
    }
  },

  cancelPreview: async (req, res, next) => {
    try {
      const userId = req.user.id
      const reservation = await ReservationModel.findOne({
        where: { id: req.params.id, userId: userId },
        include: reservationInclude
      })
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' })
      }

      const policy = await BookingPolicy.findOne({ where: { isDefault: true } })
      const minHours = (policy && policy.minHoursCancel) || 48
      const feePercent = (policy && policy.cancelFeePercent) || 50

      const firstShuttle = reservation.shuttles && reservation.shuttles[0]
      if (!firstShuttle || !firstShuttle.date) {
        return res.status(400).json({ message: 'No shuttle date found.' })
      }

      const hoursUntil = (new Date(firstShuttle.date) - new Date()) / 3600000
      const canCancel = hoursUntil >= minHours
      const total = reservation.shuttles.reduce(function (sum, s) { return sum + (s.rate || 0) }, 0)
      const fee = Number((total * feePercent / 100).toFixed(2))

      res.status(200).json({ canCancel: canCancel, fee: fee, feePercent: feePercent, minHours: minHours, hoursUntil: Math.floor(hoursUntil) })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Reservation
