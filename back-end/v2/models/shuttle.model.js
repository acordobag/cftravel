'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Shuttle = sequelize.define('shuttle', {
        date: Sequelize.DATE,
        persons: Sequelize.INTEGER,
        rate: Sequelize.FLOAT,
        distance: Sequelize.FLOAT,
        infantCount: { type: Sequelize.INTEGER, defaultValue: 0 },
        toddlerCount: { type: Sequelize.INTEGER, defaultValue: 0 },
        preschoolCount: { type: Sequelize.INTEGER, defaultValue: 0 },
        childCount: { type: Sequelize.INTEGER, defaultValue: 0 }
    })
    return Shuttle
}

const Model = model()
export default Model
