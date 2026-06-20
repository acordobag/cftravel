'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Company = sequelize.define('company', {
      name : Sequelize.STRING,
      email : Sequelize.STRING,
      tagline: Sequelize.STRING,
      address: Sequelize.STRING,
      website: Sequelize.STRING,
      logo: Sequelize.STRING,
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    })
    return Company
}

const Model = model()
export default Model
