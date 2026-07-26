'use strict'

import {
  fixedPriceExceptions,
  sourceTariffs,
  standardizedPlaces,
  standardizedPricingZones
} from './pricing-standardization.data'

const zones = new Map(standardizedPricingZones.map((zone) => [zone.code, Number(zone.oneWayPrice)]))
const places = new Map(standardizedPlaces.map((place) => [place.name, place]))
const exceptions = new Map(fixedPriceExceptions.map((route) => [route.destinationName, Number(route.price)]))

const errors = []
for (const tariff of sourceTariffs) {
  const place = places.get(tariff.destinationName)
  const resolved = exceptions.has(tariff.destinationName)
    ? exceptions.get(tariff.destinationName)
    : zones.get(place && place.pricingZoneCode)

  if (!place) {
    errors.push(`${tariff.destinationName}: destination is missing`)
  } else if (resolved !== tariff.expectedPrice) {
    errors.push(`${tariff.destinationName}: expected ${tariff.expectedPrice}, resolved ${resolved}`)
  }
}

if (sourceTariffs.length !== 32) {
  errors.push(`Expected 32 workbook tariffs, found ${sourceTariffs.length}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${sourceTariffs.length} workbook tariffs across ${standardizedPricingZones.length} zones and ${fixedPriceExceptions.length} fixed exceptions.`)
