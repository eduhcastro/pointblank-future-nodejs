/**
 * Modulos Externos
 */
const express = require('express')
const app = express()
const http = require('http').Server(app)
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const io = require('socket.io')(http)

/**
 * Meus Modulos
 */
const {routeControl} = require('./app/config')
const Sessao =     require('./app/controller/sessionController')
const DBJson =     require('./app/controller/lowdbController.js')
const Postgres =   require('./app/controller/postgreController')
const RoutesApis = new(require('./app/controller/apisController')).Apis()
const Utils =      require('./app/utils')
const sharedsession = require("express-socket.io-session")


var api = RoutesApis.createApiRouter(express, Postgres, DBJson)
var session = Sessao.module(Sessao.config)

app.use(session)
io.use(sharedsession(session))

app.use(cookieParser())
app.use(express.urlencoded({extended: true}))


app.use(function(req, res, next) {
    const parsed = {
        origin: req._parsedUrl.pathname,
        metodo: req.method,
        sessao: req.session
    }

    routeControl.search(parsed.metodo, parsed.origin, (value) => {
        if (typeof value !== 'undefined') {
            if (value.protected) {
                if (!Sessao.utils.check(req.session)) {
                    res.clearCookie("connect.sid")
                    if(value.type === "NORMAL"){
                        return res.redirect('/app/authenticate')
                    }
                    return res.json({
                        status: false,
                        error: 401
                    })
                }
            }
            if (value.authblock) {
                if (Sessao.utils.check(req.session)) {
                    return res.redirect('/')
                }
            }
        }
        return next()
    })
})

app.use('/app', api)
app.use(csrf({cookie: true}))
app.use(express.static('src/static'))

app.use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    res.status(403)
    if (req.method === 'POST') {
        res.send({
            status: false,
            errorcode: 149
        })
        return res.end()
    } else {
        res.send('form tampered with')
        return res.end()
    }
})

require('./src/App')(app, Postgres, DBJson, Utils)
require('./src/Socket')(io, DBJson, Postgres)

http.listen(8080, async function() {
    console.log('Iniciado')
})