'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Place = sequelize.define('place', {
        name: Sequelize.STRING,
        slug: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },
        description: Sequelize.TEXT,
        descriptionEs: Sequelize.TEXT,
        content: Sequelize.TEXT,
        contentEs: Sequelize.TEXT,
        zone: Sequelize.STRING,
        airportDistance: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        googlePlaceId: Sequelize.STRING,
        latitude: {
            type: Sequelize.DECIMAL(10, 7),
            allowNull: true
        },
        longitude: {
            type: Sequelize.DECIMAL(10, 7),
            allowNull: true
        },
        featured: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    })
    return Place
}

const Model = model()
export default Model
