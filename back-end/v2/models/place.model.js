'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Place = sequelize.define('place', {
        name: Sequelize.STRING,
        description: Sequelize.TEXT
    })
    return Place
}

const Model = model()
export default Model
