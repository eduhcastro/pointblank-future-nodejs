var LRU = require("lru-cache"),
    options = {
        max: 500,
        length: function(n, key) {
            return n * 2 + key.length
        },
        dispose: function(key, n) {
            n.close()
        },
        maxAge: 1000 * 60 * 60
    },
    cache = new LRU(options),
    otherCache = new LRU(50) // sets just the max size

module.exports = {
    cache,
    otherCache
}