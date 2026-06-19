'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const ServicePricingRule = sequelize.define('servicePricingRule', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    sortOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  })

  return ServicePricingRule
}

const Model = model()
export default Model
