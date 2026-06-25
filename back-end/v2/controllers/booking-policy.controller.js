'use strict'

import BookingPolicy from '../models/booking-policy.model'

const BookingPolicyController = {
  get: async (req, res, next) => {
    try {
      let policy = await BookingPolicy.findOne({ where: { isDefault: true } })
      if (!policy) {
        policy = await BookingPolicy.create({ isDefault: true })
      }
      res.status(200).json(policy)
    } catch (e) {
      next(e)
    }
  },

  update: async (req, res, next) => {
    try {
      let policy = await BookingPolicy.findOne({ where: { isDefault: true } })
      if (!policy) {
        policy = await BookingPolicy.create({ isDefault: true })
      }
      const allowed = ['infantRate', 'toddlerRate', 'preschoolRate', 'childRate', 'minHoursCancel', 'cancelFeePercent', 'minHoursEdit', 'editFeePercent']
      allowed.forEach(function (key) {
        if (req.body[key] !== undefined) {
          policy[key] = req.body[key]
        }
      })
      await policy.save()
      res.status(200).json(policy)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = BookingPolicyController
