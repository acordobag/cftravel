'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const BookingPolicy = sequelize.define('bookingPolicy', {
        infantRate: { type: Sequelize.FLOAT, defaultValue: 0 },
        toddlerRate: { type: Sequelize.FLOAT, defaultValue: 0 },
        preschoolRate: { type: Sequelize.FLOAT, defaultValue: 0 },
        childRate: { type: Sequelize.FLOAT, defaultValue: 0 },
        minHoursCancel: { type: Sequelize.INTEGER, defaultValue: 48 },
        cancelFeePercent: { type: Sequelize.FLOAT, defaultValue: 50 },
        minHoursEdit: { type: Sequelize.INTEGER, defaultValue: 24 },
        editFeePercent: { type: Sequelize.FLOAT, defaultValue: 25 },
        isDefault: { type: Sequelize.BOOLEAN, defaultValue: false }
    })
    return BookingPolicy
}

const Model = model()
export default Model
