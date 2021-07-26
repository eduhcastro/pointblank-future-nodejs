const DatabaseLow =   require('../controller/lowdbController')
const TradeFilterService = require('../Services/TradeFilterService')
const tradeFilterService = new TradeFilterService()


const Treatment = {

  Trades: async (Trades, user) =>{
    return await tradeFilterService.handler(Trades, user)
  }

}

module.exports = async function(io){

  io.sockets.on('connection',  async function(socket){

    socket.on('RoomJoin', async function(data) {
      if (data.room === 'Trades') {
          io.to(socket.id).emit('RoomJoin', {
              status: true
          })
          socket.join('Trades')
          io.to('Trades').to(socket.id).emit('Load', {
             Sessoes: await Treatment.Trades(DatabaseLow.trade("sessionTrade").get("Sessions").value(), socket.handshake.session.autorizacao)
          })
      }
    })
    
  })
}