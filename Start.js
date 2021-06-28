const express = require('express')
const app = express()
const http = require('http').Server(app)
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
//const Config = require('./app/config')
const RoutesApis = new(require('./app/controller/apisController')).Apis()
var {session, config, utils} = require('./app/controller/sessionController')

var api = RoutesApis.createApiRouter(express, utils)

app.use(session(config))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
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

require('./src/App')(app, utils)

http.listen(8080, function() {
    console.log('Iniciado')
})