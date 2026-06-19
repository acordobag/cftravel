import bcrypt from 'bcryptjs'
import Place from '../models/place.model'
import Reservation from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import UserMessage from '../models/user-message.model'

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active
})

const reservationInclude = [
  {
    model: Shuttle,
    include: [
      { model: Place, as: 'departing' },
      { model: Place, as: 'destination' }
    ]
  }
]

const Account = {
  profile: async (req, res) => {
    res.status(200).json(sanitizeUser(req.authUser))
  },

  updateProfile: async (req, res, next) => {
    try {
      const user = req.authUser
      user.name = req.body.name
      user.lastName = req.body.lastName
      user.phone = req.body.phone

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
      }

      await user.save()
      res.status(200).json(sanitizeUser(user))
    } catch (e) {
      next(e)
    }
  },

  reservations: async (req, res, next) => {
    try {
      const reservations = await Reservation.findAll({
        where: { userId: req.authUser.id },
        include: reservationInclude,
        order: [['id', 'DESC']]
      })

      res.status(200).json(reservations)
    } catch (e) {
      next(e)
    }
  },

  messages: async (req, res, next) => {
    try {
      const messages = await UserMessage.findAll({
        where: { userId: req.authUser.id },
        order: [['id', 'DESC']]
      })

      if (!messages.length) {
        return res.status(200).json([{
          id: 0,
          title: 'Welcome to your travel account',
          body: 'Your internal messages, booking updates, and trip notes will appear here.',
          kind: 'info',
          read: false,
          createdAt: new Date()
        }])
      }

      res.status(200).json(messages)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Account
