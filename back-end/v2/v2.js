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
      dbConfig().then(() => {
        const publicUrl = setting.clientUrl || ('http://localhost:' + setting.port)
        setInterval(function () {
          const http = require('http')
          const https = require('https')
          const url = publicUrl + '/health'
          const lib = url.startsWith('https') ? https : http
          lib.get(url, function (res) {
            console.log('[Health] self-ping ' + res.statusCode)
          }).on('error', function (e) {
            console.log('[Health] self-ping error: ' + e.message)
          })
        }, 10 * 60 * 1000)
      })
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
