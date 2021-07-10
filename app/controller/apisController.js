const md5 = require('md5')
const Utils = require('../utils')
module.exports.Apis = class Apis{
   
  createApiRouter (express, postgres, dbjson) {
    var router = new express.Router()
   

    //Session routes
    router.post('/authenticate', function (req, res) {

      const parameters = {
        token: req.body.csrf ?? '',
        user:  req.body.user ?? '',
        pass:  req.body.password ?? ''
      }

      if(parameters.token.length < 1 || 
         parameters.user.length < 1 ||
         parameters.pass.length < 1){

          res.status(400)
          res.json({
            status: false,
            errorcode: 101
          })
        return res.end()
        }


        postgres.query.Callback("SELECT player_id,login,password FROM accounts WHERE login = $1::text AND password = $2::text", [parameters.user,md5(parameters.pass)], function(values){
          if(typeof values.rows === 'undefined' || values.rows.length === 0)
          {
            req.session.error = "username or password is invalid"
            res.redirect('/app/authenticate')
            return res.end()
          }else{
            req.session.autorizacao = parameters.user
            req.session.autorizacaoid = values.rows[0].player_id
            res.redirect('/');
            return res.end()
          }
        })

     


    })

    router.post('/logout', function(req,res){
      req.session.destroy(function(err) {
        if(err){
          res.json({Mensagem: "Erro ao"})
          return res.end()
        }
        res.clearCookie("connect.sid")
        res.status(200)
        res.json({Mensagem: "Sessao destruida"})
        res.end()
      })
    })
    
    // Chat Routes
    router.post('/chat/load', function(req,res){
      const Messages = dbjson.chat('messagesChat').get('Messages').value()
      res.json(Messages)
      res.end()
    })

    router.post('/chat/search', function(req,res){
      const Messages = dbjson.chat('messagesChat').get('Messages').value()
        if(Messages.length > 20){
          Utils.cleanChat(dbjson.chat('messagesChat').get('Messages'))
        }
      res.json(Messages)
      res.end()
    })

    router.post('/chat/send', function(req,res){

      if(typeof req.body.message === 'undefined' ||
        req.body.message.length === 0){
          res.status(400)
          res.json({
            status: false,
            errorcode: 101
          })
        return res.end()
      }

      if(req.body.message.length > 100){
          res.status(400)
          res.json({
            status: false,
            errorcode: 102
          })
        return res.end()
      }

      postgres.query.Callback("SELECT * FROM zevolution_users WHERE userlogin = $1::text", [req.session.autorizacao], function(data){
        const Count = dbjson.chat('messagesChat').get('Messages').value().length
        dbjson.chat('messagesChat').get('Messages').push(
          {
            id: Count+1,
            level: parseInt(data.rows[0].level),
            picture: data.rows[0].picture,
            name: data.rows[0].userlogin.slice(0, -3)+'***',
            message: req.body.message.replace(/[\t\n]+/g,' ')
          }
        ).write()
        res.json({
          status: true,
          message: "Send"
        })
        return res.end()
      })
    })

    // Trade Routes
    router.post('/trade/create', function(req,res){
      const CategorysList = ['0','1','2','3']
      const Bolean = ['true','false']
      const SearchCategory = (data) => {
        if(Array.isArray(data)){
          for(var Category of data){
            if(CategorysList.indexOf(Category) === -1){
              return false
            }
          }
           return true
        }
       return false
      }

      const SearchBolean = (status) => {
            if(Bolean.indexOf(status) === -1){
              return false
            }
            return true
      }

      const Parametrs = {
      t: req.body.title    ?? '',
      c: req.body.categorys ?? '',
      d: req.body.description ?? '',
      th: req.body.thumbnail ?? '',
      b: req.body.background ?? '',
      p: req.body.public ?? ''
      }

      if(
        Parametrs.t.length < 1  ||
        Parametrs.t.length > 50 ||
        Parametrs.c.length < 1  ||
        Parametrs.c.length > 4  || // Quantidade de categorias.
        !SearchCategory(Parametrs.c) ||
        Parametrs.d.length  > 50 ||
        Parametrs.d.length  < 1 ||
        Parametrs.th.length < 1 ||
        isNaN(Parametrs.th) ||
        parseInt(Parametrs.th) > 5 || // Quantidade de Thumb. 
        Parametrs.b.length < 1 ||
        isNaN(Parametrs.b) ||
        parseInt(Parametrs.th) > 9 ||// Quantidade de BackGround // Na escolha diminiui por 1, pois começa do 0
        Parametrs.p === '' ||
        !SearchBolean(Parametrs.p)
        )
      {
        res.json({
          status: false,
          errorcode: 101
        })
      return res.end()
      }

      const CheckTradeUser = dbjson.trade('sessionTrade').get('Sessions')
      if(typeof CheckTradeUser.find({owner: req.session.autorizacao}).value() !== 'undefined'){
        res.json({
          status: false,
          errorcode: 401
        })
        return res.end()
      }

      const SessionKey = Utils.generateKey(64)
      
      dbjson.trade('sessionTrade').get('Sessions').push(
        {
          id: CheckTradeUser.value().length+1,
          name: Parametrs.t,
          sessionkey: SessionKey,
          public: Parametrs.p,
          owner: req.session.autorizacao,
          ownerid: req.session.autorizacaoid,
          participant: null,
          online: 0,
          reconnect: false,
          ownerdone: false,
          participantdone: false,
          personalization: {
            categorys: Parametrs.c,
            background: Parametrs.b,
            description: Parametrs.d,
            thumbnail: Parametrs.th
          }
        }
      ).write()

      res.json({
        status: true,
        sessionkey: SessionKey
      })
      res.end()
    })

    return router
  }

}