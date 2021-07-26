module.exports = async function(io) {
    require('../app/Controllers/ChatController')(io)
    require('../app/Controllers/TradeController')(io)
    require('../app/Controllers/SessionTradeController')(io)
}