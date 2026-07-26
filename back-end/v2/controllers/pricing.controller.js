import CarType from '../models/car-type.model'
import FixedRoutePrice from '../models/fixed-route-price.model'
import Place from '../models/place.model'
import PricingRule from '../models/pricing-rule.model'
import PricingZone from '../models/pricing-zone.model'
import ServicePricingRule from '../models/service-pricing-rule.model'
import BookingPolicy from '../models/booking-policy.model'

const fixedInclude = [
  { model: Place, as: 'departing' },
  { model: Place, as: 'destination' }
]

const zoneInclude = [
  { model: Place, as: 'origin', attributes: ['id', 'name'] }
]

const Pricing = {
  publicConfig: async (req, res, next) => {
    try {
      const pricingRules = await PricingRule.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['minDistance', 'ASC']]
      })
      const fixedRoutePrices = await FixedRoutePrice.findAll({
        where: { active: true },
        include: fixedInclude,
        order: [['id', 'ASC']]
      })
      const pricingZones = await PricingZone.findAll({
        where: { active: true },
        include: zoneInclude,
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      })
      const serviceRules = await ServicePricingRule.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      })
      const carTypes = await CarType.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      })
      const bookingPolicy = await BookingPolicy.findOne({ where: { isDefault: true } })

      res.status(200).json({ pricingRules, pricingZones, fixedRoutePrices, serviceRules, carTypes, bookingPolicy })
    } catch (e) {
      next(e)
    }
  },

  adminConfig: async (req, res, next) => {
    try {
      const pricingRules = await PricingRule.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
      const pricingZones = await PricingZone.findAll({ include: zoneInclude, order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
      const fixedRoutePrices = await FixedRoutePrice.findAll({ include: fixedInclude, order: [['id', 'ASC']] })
      const serviceRules = await ServicePricingRule.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
      const carTypes = await CarType.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
      const bookingPolicy = await BookingPolicy.findOne({ where: { isDefault: true } })
      res.status(200).json({ pricingRules, pricingZones, fixedRoutePrices, serviceRules, carTypes, bookingPolicy })
    } catch (e) {
      next(e)
    }
  },

  createRule: async (req, res, next) => {
    try {
      const rule = await PricingRule.create(req.body)
      res.status(201).json(rule)
    } catch (e) {
      next(e)
    }
  },

  updateRule: async (req, res, next) => {
    try {
      const rule = await PricingRule.findOne({ where: { id: req.params.id } })
      if (!rule) {
        return res.status(404).json({ message: 'Pricing rule not found.' })
      }
      Object.assign(rule, req.body)
      await rule.save()
      res.status(200).json(rule)
    } catch (e) {
      next(e)
    }
  },

  deleteRule: async (req, res, next) => {
    try {
      await PricingRule.destroy({ where: { id: req.params.id } })
      res.status(200).json({ success: true })
    } catch (e) {
      next(e)
    }
  },

  createZone: async (req, res, next) => {
    try {
      const zone = await PricingZone.create(req.body)
      const created = await PricingZone.findOne({ where: { id: zone.id }, include: zoneInclude })
      res.status(201).json(created)
    } catch (e) {
      next(e)
    }
  },

  updateZone: async (req, res, next) => {
    try {
      const zone = await PricingZone.findOne({ where: { id: req.params.id } })
      if (!zone) {
        return res.status(404).json({ message: 'Pricing zone not found.' })
      }
      Object.assign(zone, req.body)
      await zone.save()
      const updated = await PricingZone.findOne({ where: { id: zone.id }, include: zoneInclude })
      res.status(200).json(updated)
    } catch (e) {
      next(e)
    }
  },

  deleteZone: async (req, res, next) => {
    try {
      const assignedPlaces = await Place.count({ where: { pricingZoneId: req.params.id } })
      if (assignedPlaces) {
        return res.status(409).json({ message: 'Move destinations out of this zone before deleting it.' })
      }
      await PricingZone.destroy({ where: { id: req.params.id } })
      res.status(200).json({ success: true })
    } catch (e) {
      next(e)
    }
  },

  createFixedRoute: async (req, res, next) => {
    try {
      const route = await FixedRoutePrice.create(req.body)
      const created = await FixedRoutePrice.findOne({ where: { id: route.id }, include: fixedInclude })
      res.status(201).json(created)
    } catch (e) {
      next(e)
    }
  },

  updateFixedRoute: async (req, res, next) => {
    try {
      const route = await FixedRoutePrice.findOne({ where: { id: req.params.id } })
      if (!route) {
        return res.status(404).json({ message: 'Fixed route price not found.' })
      }
      Object.assign(route, req.body)
      await route.save()
      const updated = await FixedRoutePrice.findOne({ where: { id: req.params.id }, include: fixedInclude })
      res.status(200).json(updated)
    } catch (e) {
      next(e)
    }
  },

  deleteFixedRoute: async (req, res, next) => {
    try {
      await FixedRoutePrice.destroy({ where: { id: req.params.id } })
      res.status(200).json({ success: true })
    } catch (e) {
      next(e)
    }
  },

  createServiceRule: async (req, res, next) => {
    try {
      const rule = await ServicePricingRule.create(req.body)
      res.status(201).json(rule)
    } catch (e) {
      next(e)
    }
  },

  updateServiceRule: async (req, res, next) => {
    try {
      const rule = await ServicePricingRule.findOne({ where: { id: req.params.id } })
      if (!rule) {
        return res.status(404).json({ message: 'Service pricing rule not found.' })
      }
      Object.assign(rule, req.body)
      await rule.save()
      res.status(200).json(rule)
    } catch (e) {
      next(e)
    }
  },

  deleteServiceRule: async (req, res, next) => {
    try {
      await ServicePricingRule.destroy({ where: { id: req.params.id } })
      res.status(200).json({ success: true })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Pricing
