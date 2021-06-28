module.exports.Apis = class Apis{
   
  createApiRouter (express, utils) {
    var router = new express.Router()
   
    router.post('/authenticate', function (req, res) {
      if(utils.check(req.session)){
        res.redirect('/app/center');
        return res.end()
      }
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

        req.session.autorizacao = parameters.user

        res.redirect('/app/center');
        return res.end()


    })

    router.post('/logout', function(req,res){
      req.session.destroy(function(err) {
        if(err){
          res.json({Mensagem: "Erro ao"})
          return res.end()
        }
        res.clearCookie("connect.sid");
        res.status(200)
        res.json({Mensagem: "Sessao destruida"})
        res.end()
      })
    })
   
    return router
  }

}