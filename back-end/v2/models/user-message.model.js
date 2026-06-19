'use strict'

import db from '../db'
const { sequelize, Sequelize } = db

const model = () => {
  const UserMessage = sequelize.define('userMessage', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    kind: {
      type: Sequelize.STRING,
      defaultValue: 'info'
    },
    read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  })

  return UserMessage
}

const Model = model()
export default Model
