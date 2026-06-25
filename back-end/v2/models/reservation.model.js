'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Reservation = sequelize.define('reservation', {
        message: Sequelize.STRING,
        status: { type: Sequelize.STRING, defaultValue: 'pending' },
        companyNotes: { type: Sequelize.TEXT, allowNull: true }
    })
    return Reservation
}

const Model = model()
export default Model
