'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Reservation = sequelize.define('reservation', {
        message: Sequelize.STRING
    })
    return Reservation
}

const Model = model()
export default Model
