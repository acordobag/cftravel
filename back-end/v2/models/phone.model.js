'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Phone = sequelize.define('phone', {
        code: Sequelize.STRING,
        number: Sequelize.STRING
    })
    return Phone
}

const Model = model()
export default Model
