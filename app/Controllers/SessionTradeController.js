const Chalk = require('chalk')
const DatabaseLow =   require('../controller/lowdbController')
const ItemsFilterService = require('../Services/ItemsFilterService')
const itemsFilterService = new ItemsFilterService()


const Treatment = {

  User: {
    logged: (user) => {
        if (typeof user === 'undefined') {
          return {
            status: false,
            error: "Nao foi encontrada uma Sessão WEBSOCKET"
          }
      }
      return {
        status: true
      }
    },

    session: (key) => {
      if (typeof key === 'undefined') { 
        return {
          status: false,
          error: "Não foi definida uma trade sessão WEBSOCKET"
        }
      }
      return {
        status: true
      }
    },

    maxUsers: (database, user) => { // lowdb.acess
      if (database.owner !== user && database.participant !== null) {
        return {
          status: false,
          error: "Não foi possivel entrar na Trade WEBSOCKET"
        } // -> socket.disconnect()
      }
      return {
        status: true
      }
    },

    items: async (user) => {
      return await itemsFilterService.handler(user, itemsFilterService.Weapons)
    }
  },

  Trade: {

    find: (key) => {
      if (typeof key === 'undefined') {
        return {
          status: false,
          error: "Trade não encontrada WEBSOCKET"
        }
      }
      return {
        status: true
      }
    },

    usersOnline(sum, database){
      if(sum){
       return database.assign({online: database.value().online++}).write()
      }
      database.assign({online: database.value().online--}).write()
    },

    insertParticipant(user, database){
      database.assign({participant: user.login, participantid:user.id}).write()
    },

    removeParticipant(database){
      database.assign({participant: null,participantid: null}).write()
    },

    delete(database){
      database.remove().write()
    },

    DoneFalseAll(database){
      database.assign({ownerdone: false,participantdone: false}).write()
    },

    DoneFalse(database, owner = true){
      if(owner){
        return database.assign({ownerdone: false}).write()
      }
      database.assign({participant: false}).write()
    },

    DoneTrue(database,owner = true){
      if(owner){
        return database.assign({ownerdone: true}).write()
      }
      database.assign({participant: true}).write()
    },

    async ChangerItems(database){
      
    }
    
  },

  GetTrade: () => {
    return DatabaseLow.trade("sessionTrade").get("Sessions")
  },

  GetCourrentItems: () =>{
    return DatabaseLow.trade("courrentTrade").get("TradeCourrent")
  }



}

module.exports = async function(io){

  io.sockets.on('connection',  async function(socket){
    if(socket.handshake.headers.referer.split("?token=")[0] === 'http://localhost:8080/app/trade/exchange/'){
      socket.on('RoomJoin', async function(data) {
        if (data.room === 'CourrentTrade') {
            io.to('CourrentTrade').to(socket.id).emit('RoomJoin', {
                status: true
            })
            socket.join('CourrentTrade')
        }
      })

    let User = {
      login: socket.handshake.session.autorizacao,
      id: socket.handshake.session.autorizacaoid,
      sessao: socket.handshake.headers.referer.split("?token=")
    }

    if(!Treatment.User.logged(User.login).status){
      console.log(Chalk.red(Treatment.User.logged(User.login).error))
      return socket.disconnect()
    }

    if(typeof User.sessao[1] === 'undefined'){
      console.log(Chalk.white('[TRADE]')+Chalk.green('[JOIN]')+Chalk.red('[ERROR]')+Chalk.white('Trade não encontrada'))
      return socket.disconnect()
    }

    let Trade = {
      find: Treatment.GetTrade().find({sessionkey: User.sessao[1]}),
      findVal: Treatment.GetTrade().find({sessionkey: User.sessao[1]}).value()
    }


    if(!Treatment.Trade.find(Trade.findVal)){
      console.log(Chalk.red(Treatment.Trade.find(Trade.findVal).error))
      return socket.disconnect()
    }
    
    if(!Treatment.User.maxUsers(Trade.findVal, User.login).status){
      console.log(Chalk.red(Treatment.User.maxUsers(Trade.findVal, User.login).error))
      return socket.disconnect()
    }

    let TradeCourrent = {
      participant: Trade.findVal.participant,
      owner: Trade.findVal.owner,
      ownerid: Trade.findVal.ownerid
    }

    if(TradeCourrent.owner === User.login){
      console.log(Chalk.white('[TRADE]')+Chalk.green('[JOIN]')+Chalk.green('[OK]')+Chalk.white('Dono acessou ')+Chalk.yellow(User.sessao[1]))
      io.emit(`${User.sessao[1]}::getItems`, {
        items: await Treatment.User.items(User.id),
        owner: User.login
      })
    }else{
      if(Trade.findVal.participant !== null){
        console.log(`[TRADE][JOIN][ERRO] Já existe um participante`)
        return socket.disconnect()
      }
      
      console.log(Chalk.white('[TRADE]')+Chalk.green('[JOIN]')+Chalk.green('[OK]')+Chalk.white('Participante acessou ')+Chalk.yellow(User.sessao[1]))
      Treatment.Trade.insertParticipant(User,Trade.find)
      
      io.emit(`${User.sessao[1]}::getItems`, {
        items: await Treatment.User.items(User.id),
        owner: User.login
      })

      io.to(socket.id).emit(`${User.sessao[1]}::getItems`, {
        items: await Treatment.User.items(TradeCourrent.ownerid),
        owner: TradeCourrent.owner
      })

    }

    socket.on(`${User.sessao[1]}::addItems`, (data) => {
      const ItemsCourrent = Treatment.GetCourrentItems()

      if(Trade.findVal.ownerdone || Trade.findVal.participantdone){
         Treatment.Trade.DoneFalseAll()
         io.emit(`${User.sessao[1]}`,{
          user: User.login,
          irregularity: true
         })
      }

        ItemsCourrent.push({
          id: parseInt(data.item),
          item: parseInt(data.item),
          count: parseInt(data.count),
          owner: User.login,
          ownerID: User.login === TradeCourrent.owner ? TradeCourrent.ownerid: User.id,
          type: data.type,
          session: User.sessao[1]
        }).write()

        io.emit(`${User.sessao[1]}::reciveItems`, {
          id: ItemsCourrent.find({
              session: User.sessao[1],
              item: parseInt(data.item)
          }).value().id,
          item: parseInt(data.item),
          count: parseInt(data.count),
          values: 123,
          owner: User.login,
          type: data.type,
      })
    })

    socket.on(`${User.sessao[1]}::removeItems`, (data) => {

      if(Trade.findVal.ownerdone || Trade.findVal.participantdone){
        Treatment.Trade.DoneFalseAll()
        io.emit(`${User.sessao[1]}`,{
         user: User.login,
         irregularity: true
        })
      }
      const ItemsCourrent = Treatment.GetCourrentItems()

      if(typeof ItemsCourrent.find({id: parseInt(data.item),owner: User.login}).value() === undefined) {
        return console.log(`[TRADE][REMOVEITEM][ERROR] Não é possivel, o item nao existe`)
        // socket.disconnect() ? 
      }

      ItemsCourrent.remove({
        id: parseInt(data.item),
        owner: User.login
      }).write() 
      
      io.emit(`${User.sessao[1]}::removeItems`, {
        id: parseInt(data.item),
        count: 0,
        owner: User.login,
        value: 0
      })

    })

    socket.on(`${User.sessao[1]}::ready`, async (data) => {
      const ItemsCourrent = Treatment.GetCourrentItems()
      if(typeof ItemsCourrent.find({session: User.sessao[1], owner: User.login}).value() === 'undefined'){
        console.log("Não é possivel mudar o status do usuario sem ter nenhum item na trade corrente")
        return socket.disconnect()
      }

      if(data.status){
        Treatment.Trade.DoneTrue(Trade.find, User.login === TradeCourrent.owner ? true: false)
        if(Trade.findVal.ownerdone && Trade.findVal.participantdone){
          // Aqui faz a troca, await tradesclass.items....
        }
        io.emit(`${User.sessao[1]}::ready`,{
          user: User.login,
          status: true
        })

      }else{
        Treatment.Trade.DoneFalse(Trade.find, User.login === TradeCourrent.owner ? true: false)
        io.emit(`${User.sessao[1]}::ready`,{
          user: User.login,
          status: false
        })
      }

    })

    socket.on("disconnect", () => {
      if(typeof Trade.findVal !== 'undefined'){
        Treatment.Trade.usersOnline(false, Trade.find)

        if(TradeCourrent.owner === User.login){
          io.to('CourrentTrade').emit(`${User.sessao[1]}::Disconnect`, {
            level: 0,
            user: 0
          })
          console.log(`O Dono da trade Saiu! [${User.sessao[1]}]`)
          Treatment.Trade.delete(Treatment.GetTrade())
        }else{
          io.emit(`${User.sessao[1]}::Disconnect`, {
            level: 0,
            user: 1
          })
          console.log(`O Participante saiu! [${User.sessao[1]}]`)
          Treatment.Trade.removeParticipant(Trade.find)
        }
      }
    })
  }
  })
}