const session = {
    module : require('express-session'),

    config: {
        secret: 'castroms2021pointblank',
        resave: false,
        saveUninitialized: false,
    },

    utils: {
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
}

module.exports = session