'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const Testimonial = sequelize.define('testimonial', {
    name: Sequelize.STRING,
    location: Sequelize.STRING,
    route: Sequelize.STRING,
    rating: Sequelize.INTEGER,
    comment: Sequelize.TEXT,
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  })

  return Testimonial
}

const Model = model()
export default Model
