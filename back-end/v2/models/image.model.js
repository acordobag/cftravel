'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
    const Image = sequelize.define('image', {
        src: Sequelize.STRING
    })
    return Image
}

const Model = model()
export default Model
