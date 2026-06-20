import Company from '../models/company.model'
import Message from '../models/message.model'
import Phone from '../models/phone.model'
import Place from '../models/place.model'
import Reservation from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import User from '../models/user.model'

const companyInclude = [{
  model: Phone,
  where: { active: true },
  required: false
}]

const companyOrder = [[Phone, 'sortOrder', 'ASC'], [Phone, 'id', 'ASC']]

const reservationInclude = [
  { model: User, attributes: ['id', 'name', 'lastName', 'email', 'phone'] },
  {
    model: Shuttle,
    include: [
      { model: Place, as: 'departing' },
      { model: Place, as: 'destination' }
    ]
  }
]

const loadReservation = (id) => Reservation.findOne({
  where: { id },
  include: reservationInclude
})

const AdminMaintenance = {
  findReservations: async (req, res, next) => {
    try {
      const reservations = await Reservation.findAll({
        include: reservationInclude,
        order: [['id', 'DESC']]
      })
      res.status(200).send(reservations).end()
    } catch (e) {
      next(e)
    }
  },

  updateReservation: async (req, res, next) => {
    try {
      const reservation = await Reservation.findOne({ where: { id: req.params.id } })
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' })
      }

      reservation.message = req.body.message
      await reservation.save()
      res.status(200).send(await loadReservation(req.params.id)).end()
    } catch (e) {
      next(e)
    }
  },

  deleteReservation: async (req, res, next) => {
    try {
      await Shuttle.destroy({ where: { reservationId: req.params.id } })
      await Reservation.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  },

  updateShuttle: async (req, res, next) => {
    try {
      const shuttle = await Shuttle.findOne({ where: { id: req.params.id } })
      if (!shuttle) {
        return res.status(404).json({ message: 'Shuttle not found.' })
      }

      shuttle.date = req.body.date
      shuttle.persons = req.body.persons
      shuttle.departingId = req.body.departingId
      shuttle.destinationId = req.body.destinationId
      await shuttle.save()

      const updated = await Shuttle.findOne({
        where: { id: req.params.id },
        include: [
          { model: Place, as: 'departing' },
          { model: Place, as: 'destination' }
        ]
      })
      res.status(200).send(updated).end()
    } catch (e) {
      next(e)
    }
  },

  deleteShuttle: async (req, res, next) => {
    try {
      await Shuttle.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  },

  findCompanies: async (req, res, next) => {
    try {
      const companies = await Company.findAll({
        include: [{ model: Phone }],
        order: [['id', 'ASC']]
      })
      res.status(200).send(companies).end()
    } catch (e) {
      next(e)
    }
  },

  findDefaultCompany: async (req, res, next) => {
    try {
      let company = await Company.findOne({
        where: { isDefault: true },
        include: companyInclude,
        order: companyOrder
      })

      if (!company) {
        company = await Company.findOne({
          include: companyInclude,
          order: [['id', 'ASC'], ...companyOrder]
        })
      }

      res.status(200).send(company || null).end()
    } catch (e) {
      next(e)
    }
  },

  createCompany: async (req, res, next) => {
    try {
      const company = await Company.create({
        name: req.body.name,
        email: req.body.email,
        tagline: req.body.tagline,
        address: req.body.address,
        website: req.body.website,
        logo: req.body.logo,
        isDefault: req.body.isDefault === true || req.body.isDefault === 'true'
      })

      if (company.isDefault) {
        await Company.update({ isDefault: false }, { where: { isDefault: true } })
        company.isDefault = true
        await company.save()
      }

      if (Array.isArray(req.body.phones) && req.body.phones.length) {
        await Phone.bulkCreate(req.body.phones.map((phone) => ({
          type: phone.type || 'phone',
          label: phone.label || phone.code,
          code: phone.code,
          number: phone.number,
          href: phone.href,
          active: phone.active !== false,
          sortOrder: phone.sortOrder || 0,
          companyId: company.id
        })))
      }

      const created = await Company.findOne({ where: { id: company.id }, include: [{ model: Phone }] })
      res.status(201).send(created).end()
    } catch (e) {
      next(e)
    }
  },

  updateCompany: async (req, res, next) => {
    try {
      const company = await Company.findOne({ where: { id: req.params.id } })
      if (!company) {
        return res.status(404).json({ message: 'Company not found.' })
      }

      company.name = req.body.name
      company.email = req.body.email
      company.tagline = req.body.tagline
      company.address = req.body.address
      company.website = req.body.website
      company.logo = req.body.logo
      company.isDefault = req.body.isDefault === true || req.body.isDefault === 'true'
      await company.save()

      if (company.isDefault) {
        await Company.update({ isDefault: false }, { where: { isDefault: true } })
        company.isDefault = true
        await company.save()
      }

      const updated = await Company.findOne({ where: { id: req.params.id }, include: [{ model: Phone }] })
      res.status(200).send(updated).end()
    } catch (e) {
      next(e)
    }
  },

  deleteCompany: async (req, res, next) => {
    try {
      await Phone.destroy({ where: { companyId: req.params.id } })
      await Company.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  },

  createPhone: async (req, res, next) => {
    try {
      const phone = await Phone.create({
        type: req.body.type || 'phone',
        label: req.body.label || req.body.code,
        code: req.body.code || req.body.label,
        number: req.body.number,
        href: req.body.href,
        active: req.body.active !== false,
        sortOrder: req.body.sortOrder || 0,
        companyId: req.body.companyId
      })
      res.status(201).send(phone).end()
    } catch (e) {
      next(e)
    }
  },

  updatePhone: async (req, res, next) => {
    try {
      const phone = await Phone.findOne({ where: { id: req.params.id } })
      if (!phone) {
        return res.status(404).json({ message: 'Phone not found.' })
      }

      phone.type = req.body.type || 'phone'
      phone.label = req.body.label || req.body.code
      phone.code = req.body.code || req.body.label
      phone.number = req.body.number
      phone.href = req.body.href
      phone.active = req.body.active !== false
      phone.sortOrder = req.body.sortOrder || 0
      phone.companyId = req.body.companyId
      await phone.save()
      res.status(200).send(phone).end()
    } catch (e) {
      next(e)
    }
  },

  deletePhone: async (req, res, next) => {
    try {
      await Phone.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  },

  findMessages: async (req, res, next) => {
    try {
      const messages = await Message.findAll({ order: [['id', 'DESC']] })
      res.status(200).send(messages).end()
    } catch (e) {
      next(e)
    }
  },

  createMessage: async (req, res, next) => {
    try {
      const message = await Message.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        text: req.body.text
      })
      res.status(201).send(message).end()
    } catch (e) {
      next(e)
    }
  },

  updateMessage: async (req, res, next) => {
    try {
      const message = await Message.findOne({ where: { id: req.params.id } })
      if (!message) {
        return res.status(404).json({ message: 'Message not found.' })
      }

      message.name = req.body.name
      message.phone = req.body.phone
      message.email = req.body.email
      message.text = req.body.text
      await message.save()
      res.status(200).send(message).end()
    } catch (e) {
      next(e)
    }
  },

  deleteMessage: async (req, res, next) => {
    try {
      await Message.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = AdminMaintenance
