
'use strict'
const fs = require('fs')
const path = require('path')
const env = process.env

export default {
    enviroment: env.NODE_ENV || 'development',
    port: env.PORT || 8080,
    host: env.HOST || '',
    clientUrl: env.CLIENT_URL || `http://localhost:8080`,
    authentication: {
      jwtSecret: 'CfTravel20'
    },
    paypalSettings: {
      clientId: '',
      secret: '',
      enviroment: ''
    },
    mailSettings: {
      user: '',
      pass: ''
    },
    smsSettings: {
      key: '',
      secret: ''
    },
    moneyGram: {
      endpoint: '',
      user: '',
      password: ''
    },
    payments: {
      key: "",
      secret: ""
    },
    dbSettings: {
      host: env.DB_HOST || '127.0.0.1',
      port: env.DB_PORT || 3306,
      username: env.DB_USER || 'cftravel',
      password: env.DB_PASSWORD || 'CfTravel20',
      database: env.DB_NAME || 'cftravel',
      dialect: 'mysql',
      // timezone: 'America/Costa_Rica',
      logging: msg => {
        fs.appendFile(path.join(__dirname, '../db', 'log.log'), msg, (err) => {
          if (err) {
            return console.log(err)
          }
        })
      },
      define: { timestamps: false },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  }
  
