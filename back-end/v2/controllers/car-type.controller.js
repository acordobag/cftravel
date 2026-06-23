import CarType from '../models/car-type.model'

const CarTypeController = {
  findAll: async (req, res, next) => {
    try {
      const types = await CarType.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      })
      res.status(200).json(types)
    } catch (e) {
      next(e)
    }
  },

  findAllAdmin: async (req, res, next) => {
    try {
      const types = await CarType.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
      res.status(200).json(types)
    } catch (e) {
      next(e)
    }
  },

  create: async (req, res, next) => {
    try {
      const type = await CarType.create(req.body)
      res.status(201).json(type)
    } catch (e) {
      next(e)
    }
  },

  update: async (req, res, next) => {
    try {
      const type = await CarType.findOne({ where: { id: req.params.id } })
      if (!type) return res.status(404).json({ message: 'Vehicle type not found.' })
      Object.assign(type, req.body)
      await type.save()
      res.status(200).json(type)
    } catch (e) {
      next(e)
    }
  },

  delete: async (req, res, next) => {
    try {
      await CarType.destroy({ where: { id: req.params.id } })
      res.status(200).json({ success: true })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = CarTypeController
