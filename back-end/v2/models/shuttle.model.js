'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Shuttle = sequelize.define('shuttle', {
        date: Sequelize.DATE,
        persons: Sequelize.INTEGER
    })
    return Shuttle
}

const Model = model()
export default Model
