'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const User = sequelize.define('user', {
        name: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: { type: Sequelize.STRING, unique: 'mailIndex' },
        password: Sequelize.STRING,
        token: Sequelize.STRING,
        phone: Sequelize.STRING,
        role: {
            type: Sequelize.STRING,
            defaultValue: 'USER'
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    })
    return User
}

const Model = model()
export default Model
