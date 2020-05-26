'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Company = sequelize.define('company', {
      name : Sequelize.STRING,
      email : Sequelize.STRING
    })
    return Company
}

const Model = model()
export default Model
