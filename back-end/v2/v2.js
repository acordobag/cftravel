'use strict'

import setting from './config'
import express from 'express'
import http from 'http'
import chalk from 'chalk'
import config from './server.config'
import dbConfig from './db/db.config'
import { name } from './package.json'

const app = express()

let _server

const server = {
  start() {
    _server = http.createServer(app)

    config(app, _server)
    if (setting.enviroment === 'development') {
      _server.listen(setting.port, () => { //,
        console.log(chalk.cyan(`[Server] -  ${name}`))
        console.log(chalk.cyan(`Port: http://${setting.host}:${setting.port}/`))
        console.log(chalk.yellow(`App Port: http://${setting.host}:8080/`))
        dbConfig()
      })
    } else {
      _server.listen(setting.port)
      dbConfig()
    }
  },
  stop() {
    _server.close()
  }
}

export default server

if (!module.parent) {
  server.start()
}
