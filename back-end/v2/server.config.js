'use strict'

let { enviroment } = require('./config')
if (enviroment === 'development') require('longjohn')

import express from 'express'
import cors from 'cors'
import path from 'path'
import router from './routes/routes'

export default (app, server) => {

  app.disable('x-powered-by')

  //                __  __ _     _     _ _
  //  _____ _____  |  \/  (_) __| | __| | | _____      ____ _ _ __ ___ ___   _____ _____
  // |_____|_____| | |\/| | |/ _` |/ _` | |/ _ \ \ /\ / / _` | '__/ _ / __| |_____|_____|
  // |_____|_____| | |  | | | (_| | (_| | |  __/\ V  V | (_| | | |  __\__ \ |_____|_____|
  //               |_|  |_|_|\__,_|\__,_|_|\___| \_/\_/ \__,_|_|  \___|___/

  app.use(cors())
  //app.use(morgan('dev'))
  app.use(express.json())


  //                ____             _
  //  _____ _____  |  _ \ ___  _   _| |_ ___ ___   _____ _____
  // |_____|_____| | |_) / _ \| | | | __/ _ / __| |_____|_____|
  // |_____|_____| |  _ | (_) | |_| | ||  __\__ \ |_____|_____|
  //               |_| \_\___/ \__,_|\__\___|___/

  app.use('/api', router)

  //                ____  _        _   _        _____ _ _
  //  _____ _____  / ___|| |_ __ _| |_(_) ___  |  ___(_| | ___ ___   _____ _____
  // |_____|_____| \___ \| __/ _` | __| |/ __| | |_  | | |/ _ / __| |_____|_____|
  // |_____|_____|  ___) | || (_| | |_| | (__  |  _| | | |  __\__ \ |_____|_____|
  //               |____/ \__\__,_|\__|_|\___| |_|   |_|_|\___|___/

  app.use('/dist', express.static(path.join(__dirname, 'dist')))
  app.use(express.static(path.join(__dirname, 'dist')))

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
  })

  //                _____                       _   _                 _ _
  //  _____ _____  | ____|_ __ _ __ ___  _ __  | | | | __ _ _ __   __| | | ___ _ __   _____ _____
  // |_____|_____| |  _| | '__| '__/ _ \| '__| | |_| |/ _` | '_ \ / _` | |/ _ | '__| |_____|_____|
  // |_____|_____| | |___| |  | | | (_) | |    |  _  | (_| | | | | (_| | |  __| |    |_____|_____|
  //               |_____|_|  |_|  \___/|_|    |_| |_|\__,_|_| |_|\__,_|_|\___|_|

  app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  app.use((err, req, res, next) => {
    console.log(err)
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = enviroment === 'development' ? err : { error: 'Ocurrió un error inesperado, por favor contacte a su administrador.' }
    // render the error page
    res.status(err.status || 500)
    // custom error for sequelize validation
    if (err.errors) {
      let errors = []
      err.errors.map(e => {
        let error = {
          field: e.path,
          value: e.value,
          message: e.message
        }

        errors.push(error)
      })

      return res.json({ error: true, type: 'validation', errors })
    }
    res.json({ error : err })
  })
}
