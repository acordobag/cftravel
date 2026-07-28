'use strict'

import { Op } from 'sequelize'

import db from './index'
import Company from '../models/company.model'
import Image from '../models/image.model'
import Place from '../models/place.model'

const run = async () => {
  const destinations = await Place.findAll({
    where: { slug: { [Op.ne]: null } },
    attributes: ['id', 'slug', 'content', 'contentEs'],
    raw: true
  })
  const destinationIds = destinations.map((place) => place.id)
  const attributedImages = destinationIds.length
    ? await Image.count({
        where: {
          placeId: { [Op.in]: destinationIds },
          sourceUrl: { [Op.ne]: null },
          credit: { [Op.ne]: null },
          license: { [Op.ne]: null }
        }
      })
    : 0
  const company = await Company.findOne({
    where: { isDefault: true },
    attributes: [
      'aboutUsText',
      'aboutUsTextEs',
      'cancellationPolicyText',
      'cancellationPolicyTextEs'
    ],
    raw: true
  })

  const result = {
    destinations: destinations.length,
    uniqueSlugs: new Set(destinations.map((place) => place.slug)).size,
    bilingualDestinations: destinations.filter((place) => place.content && place.contentEs).length,
    attributedImages,
    companyContent: {
      aboutEn: Boolean(company && company.aboutUsText),
      aboutEs: Boolean(company && company.aboutUsTextEs),
      policyEn: Boolean(company && company.cancellationPolicyText),
      policyEs: Boolean(company && company.cancellationPolicyTextEs)
    }
  }

  console.log(JSON.stringify(result, null, 2))
  const isValid = result.destinations >= 11 &&
    result.uniqueSlugs === result.destinations &&
    result.bilingualDestinations >= 11 &&
    result.attributedImages >= 11 &&
    Object.values(result.companyContent).every(Boolean)

  await db.close()
  process.exit(isValid ? 0 : 1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
