'use strict'

import fs from 'fs'
import path from 'path'
import { Op } from 'sequelize'

import db from './index'
import dbConfig from './db.config'
import Company from '../models/company.model'
import Image from '../models/image.model'
import Place from '../models/place.model'
import PricingZone from '../models/pricing-zone.model'
import { aboutContent, destinationContent, policyContent } from './site-content.data'

const backupContent = async () => {
  const snapshot = {
    createdAt: new Date().toISOString(),
    companies: await Company.findAll({ raw: true }),
    places: await Place.findAll({ raw: true }),
    images: await Image.findAll({ raw: true })
  }
  const backupDir = path.join(__dirname, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = snapshot.createdAt.replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `site-content-${stamp}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2))
  return backupPath
}

const findDestination = async (item, transaction) => {
  const candidates = await Place.findAll({
    where: { name: { [Op.in]: item.aliases } },
    transaction
  })
  return candidates.find((place) => place.name === item.name) || candidates[0] || null
}

const run = async () => {
  await dbConfig()
  const backupPath = await backupContent()
  let updatedDestinations = 0

  await db.transaction(async (transaction) => {
    let company = await Company.findOne({ where: { isDefault: true }, transaction })
    if (!company) {
      company = await Company.findOne({ order: [['id', 'ASC']], transaction })
    }
    if (!company) {
      throw new Error('No company exists. Create the default company before importing site content.')
    }

    company.aboutUsText = aboutContent.en
    company.aboutUsTextEs = aboutContent.es
    company.cancellationPolicyText = policyContent.en
    company.cancellationPolicyTextEs = policyContent.es
    await company.save({ transaction })

    for (const item of destinationContent) {
      const pricingZone = item.pricingZoneCode
        ? await PricingZone.findOne({ where: { code: item.pricingZoneCode }, transaction })
        : null
      let place = await findDestination(item, transaction)

      if (!place) {
        place = await Place.create({
          name: item.name,
          zone: item.zone,
          featured: true,
          active: true
        }, { transaction })
      }

      Object.assign(place, {
        name: item.name,
        slug: item.slug,
        zone: item.zone,
        description: item.description,
        descriptionEs: item.descriptionEs,
        content: item.content,
        contentEs: item.contentEs,
        featured: true,
        active: true
      })
      if (pricingZone) {
        place.pricingZoneId = pricingZone.id
      }
      await place.save({ transaction })

      let image = await Image.findOne({
        where: { placeId: place.id },
        order: [['id', 'ASC']],
        transaction
      })
      if (!image) {
        image = await Image.create({ placeId: place.id }, { transaction })
      }
      Object.assign(image, item.image, { placeId: place.id })
      await image.save({ transaction })
      updatedDestinations += 1
    }
  })

  console.log(`Site content imported for ${updatedDestinations} destinations. Backup: ${backupPath}`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
