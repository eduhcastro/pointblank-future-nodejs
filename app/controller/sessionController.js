const session = require('express-session')

const config = {
    secret: 'castroms2021pointblank',
    resave: false,
    saveUninitialized: false,
}

const utils = {

    check: function(session) {
        if (session === 'undefined') {
            return false
        }
        if (typeof session.autorizacao === 'undefined') {
            return false
        }
        return true
    }

}

module.exports = {
    session,
    config,
    utils
}