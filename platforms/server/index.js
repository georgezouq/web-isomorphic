import Koa from 'koa'
import middlewareRegister from './middlewareRegister'

const app = new Koa()
app.env = 'production'
middlewareRegister(app) // reg midleware

import http from 'http'
import config from '../common/config'
const server = http.createServer(app.callback())

server.listen(config.port, () => {
    console.log('Server start at port %d, CTRL + C to terminate',
    config.port)
})
