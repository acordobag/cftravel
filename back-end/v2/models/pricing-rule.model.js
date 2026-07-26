'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const PricingRule = sequelize.define('pricingRule', {
    name: Sequelize.STRING,
    minDistance: Sequelize.FLOAT,
    maxDistance: Sequelize.FLOAT,
    baseFare: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    pricePerKm: Sequelize.FLOAT,
    operationsRatePerKm: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
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
