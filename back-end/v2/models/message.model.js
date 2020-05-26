'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Message = sequelize.define('message', {
        name: Sequelize.STRING,
        phone: Sequelize.STRING,
        email: Sequelize.STRING,
        text: Sequelize.STRING
    })
    return Message
}

const Model = model()
export default Model
