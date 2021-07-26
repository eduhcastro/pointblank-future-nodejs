const DatabaseLow =   require('../controller/lowdbController')
const ChatInsertMessageService = require('../Services/ChatInsertMessageService')
const UserFindEvolutionService = require('../Services/UserFindEvolutionService')
const chatInsertMessageService = new ChatInsertMessageService()
const userFindEvolutionService = new UserFindEvolutionService()

const Treatment = {

  User: (user) => {
    if (typeof user === 'undefined') {
        return {
          status: false,
          error: "NotUser"
        }
      }
      return {
        status: true
      }
  },

  Message: (message) => {
    if(typeof message === 'undefined' ||
        message.length === 0){
         return {
           status: false, 
           error:"Message invalid"
          }
      }

      if(message.length > 200){
        return {
          status: false, 
          error:"Max Length"
        }
      }
    return {
      status: true
    }
  },

  Insert: async (user, message) => {
    return await chatInsertMessageService.handler(user, message)
  },

  UserDetails: async (user) => {
    return await userFindEvolutionService.handler(user)
  }
}

module.exports = async function(io) {
  io.sockets.on('connect', function(socket){
    
    socket.on('RoomJoin', function(data) {
        if (data.room === 'Chat') {
            io.to(socket.id).emit('RoomJoin', {
                status: true
            })
            socket.join('Chat')
            io.to('Chat').to(socket.id).emit('Load', {
                Messages: DatabaseLow.chat('messagesChat').get('Messages').value()
            })
        }
    })

    socket.on('SendMessage', async function(message) {

      if(!Treatment.User(socket.handshake.session.autorizacao).status){
        return io.to('Chat').to(socket.id).emit('SendMessage', Treatment.User(socket.handshake.session.autorizacao))
      }

      if(!Treatment.Message(message.message).status){
        return io.to('Chat').to(socket.id).emit('SendMessage', Treatment.Message(message.message))
      }

      await Treatment.Insert(socket.handshake.session.autorizacao, message.message)
      const UserDetails = await Treatment.UserDetails(socket.handshake.session.autorizacao)
      io.to('Chat').emit('Message', {
          id: 99,
          level:   UserDetails[0].level,
          picture: UserDetails[0].picture,
          name:    socket.handshake.session.autorizacao.slice(0, -3)+'***',
          message: message.message
        })
    })
})

}