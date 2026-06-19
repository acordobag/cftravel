'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const PricingRule = sequelize.define('pricingRule', {
    name: Sequelize.STRING,
    minDistance: Sequelize.FLOAT,
    maxDistance: Sequelize.FLOAT,
    pricePerKm: Sequelize.FLOAT,
    discount: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    sortOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  })

  return PricingRule
}

const Model = model()
export default Model
