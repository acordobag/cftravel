'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const PricingZone = sequelize.define('pricingZone', {
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    oneWayPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    roundTripPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    },
    notes: Sequelize.TEXT,
    requiresReview: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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

  return PricingZone
}

const Model = model()
export default Model
