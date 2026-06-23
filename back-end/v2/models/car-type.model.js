'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const CarType = sequelize.define('carType', {
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    capacity: {
      type: Sequelize.INTEGER,
      defaultValue: 4
    },
    extraPassengerCharge: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    maxExtraPassengers: {
      type: Sequelize.INTEGER,
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

  return CarType
}

const Model = model()
export default Model
