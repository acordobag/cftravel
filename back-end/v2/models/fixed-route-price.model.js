'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const FixedRoutePrice = sequelize.define('fixedRoutePrice', {
    price: Sequelize.FLOAT,
    label: Sequelize.STRING,
    notes: Sequelize.TEXT,
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  })

  return FixedRoutePrice
}

const Model = model()
export default Model
