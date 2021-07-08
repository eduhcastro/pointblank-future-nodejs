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
const TradesClass = new(require('./app/class/tradeClass'))
//const asd = DBJson.trade('sessionTrade').get('Sessions')
//console.log(md5('teupaitamorto'))
//console.log(asd.value())



var api = RoutesApis.createApiRouter(express, Postgres, DBJson)
var session = Sessao.module(Sessao.config)

app.use(session)
io.use(sharedsession(session));

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

//io.use((socket, next) => {
//
//    console.log(socket.handshake.headers.cookie)
//    console.log('OK')
//    Sessao.module(Sessao.config)(socket.request, {asd: "123"}, next);
//    // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
//    // connections, as 'socket.request.res' will be undefined in that case
//})

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
    //query.Callback("SELECT * FROM accounts WHERE login = $1::text LIMIT 1", ['thegotza1'], function(values){
    //    console.log(values.rows)
    //})
    //console.log(await query.Execute("SELECT * FROM accounts LIMIT 1"))

    console.log('Iniciado')
})