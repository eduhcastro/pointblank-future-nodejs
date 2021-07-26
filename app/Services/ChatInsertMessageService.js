const Postgre = require('../controller/postgreController')
const LowDB =   require('../controller/lowdbController')
const Utils =   require('../utils')

class ChatInsertMessageService{

  async handler(user, message){
    const Messages = LowDB.chat('messagesChat').get('Messages').value()
    if(Messages.length > 30){
          Utils.cleanChat(LowDB.chat('messagesChat').get('Messages'))
    }
    Postgre.query.Callback("SELECT * FROM zevolution_users WHERE userlogin = $1::text", [user], function(data){
      const Count = LowDB.chat('messagesChat').get('Messages').value().length
      LowDB.chat('messagesChat').get('Messages').push(
        {
          id: LowDB.chat('messagesChat').get('Messages').value()[Count - 1].id+1,
          level: parseInt(data.rows[0].level),
          picture: data.rows[0].picture,
          name: data.rows[0].userlogin.slice(0, -3)+'***',
          message: message.replace(/[\t\n]+/g,' ')
        }
      ).write()
    })
  }

}
module.exports = ChatInsertMessageService