'use strict'

import settings from '../config'
const config = settings.dbSettings

import Sequelize from 'sequelize'

let db = null
if (!db) {
  db = new Sequelize(config.database, config.username, config.password, config)
}

db.Sequelize = Sequelize
db.sequelize = db

export default db
