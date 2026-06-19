'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Phone = sequelize.define('phone', {
        type: {
            type: Sequelize.STRING,
            defaultValue: 'phone'
        },
        label: Sequelize.STRING,
        code: Sequelize.STRING,
        number: Sequelize.STRING,
        href: Sequelize.STRING,
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        sortOrder: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    })
    return Phone
}

const Model = model()
export default Model
