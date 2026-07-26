'use strict'

import fs from 'fs'
import path from 'path'

import db from './index'
import dbConfig from './db.config'
import FixedRoutePrice from '../models/fixed-route-price.model'
import Place from '../models/place.model'
import PricingRule from '../models/pricing-rule.model'
import PricingZone from '../models/pricing-zone.model'
import {
  fixedPriceExceptions,
  standardizedPlaces,
  standardizedPricingRules,
  standardizedPricingZones
} from './pricing-standardization.data'

const backupPricing = async () => {
  const snapshot = {
    createdAt: new Date().toISOString(),
    pricingRules: await PricingRule.findAll({ raw: true }),
    pricingZones: await PricingZone.findAll({ raw: true }),
    fixedRoutePrices: await FixedRoutePrice.findAll({ raw: true }),
    places: await Place.findAll({ raw: true })
  }
  const backupDir = path.join(__dirname, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = snapshot.createdAt.replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `pricing-${stamp}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2))
  return backupPath
}

const run = async () => {
  await dbConfig()
  const backupPath = await backupPricing()

  await db.transaction(async (transaction) => {
    const [origin] = await Place.findOrCreate({
      where: { name: 'SJO Airport' },
      defaults: standardizedPlaces[0],
      transaction
    })

    const zonesByCode = {}
    for (const item of standardizedPricingZones) {
      const [zone] = await PricingZone.findOrCreate({
        where: { code: item.code },
        defaults: { ...item, originPlaceId: origin.id, active: true },
        transaction
      })
      Object.assign(zone, item, { originPlaceId: origin.id, active: true })
      await zone.save({ transaction })
      zonesByCode[item.code] = zone
    }

    const placesByName = { [origin.name]: origin }
    for (const item of standardizedPlaces) {
      const zone = item.pricingZoneCode ? zonesByCode[item.pricingZoneCode] : null
      const defaults = {
        name: item.name,
        zone: item.zone || '',
        description: item.description || '',
        featured: Boolean(item.featured),
        pricingZoneId: zone ? zone.id : null
      }
      const [place, created] = await Place.findOrCreate({
        where: { name: item.name },
        defaults,
        transaction
      })

      place.zone = item.zone || place.zone || ''
      place.pricingZoneId = zone ? zone.id : place.pricingZoneId
      if (created || item.featured) {
        place.featured = Boolean(item.featured)
      }
      if (item.description && (item.updateDescription || !place.description)) {
        place.description = item.description
      }
      await place.save({ transaction })
      placesByName[item.name] = place
    }

    await PricingRule.update({ active: false }, { where: {}, transaction })
    for (const item of standardizedPricingRules) {
      const [rule] = await PricingRule.findOrCreate({
        where: { name: item.name },
        defaults: { ...item, active: true },
        transaction
      })
      Object.assign(rule, item, { active: true })
      await rule.save({ transaction })
    }

    for (const item of fixedPriceExceptions) {
      const destination = placesByName[item.destinationName]
      if (!destination) continue
      const [route] = await FixedRoutePrice.findOrCreate({
        where: { departingId: origin.id, destinationId: destination.id },
        defaults: {
          price: item.price,
          roundTripPrice: null,
          label: item.label,
          notes: item.notes,
          active: true
        },
        transaction
      })
      route.price = item.price
      route.label = item.label
      route.notes = item.notes
      route.active = true
      await route.save({ transaction })
    }
  })

  console.log(`Pricing standardized. Backup: ${backupPath}`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
