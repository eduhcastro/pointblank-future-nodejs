module.exports = function(app, postgres, dbjson, utils) {


  app.set('view engine', 'ejs');

  // Autenticação
  app.get("/app/authenticate", function(req, res) {
      res.status(200)
      const error = req.session.error
      typeof error !== 'undefined' ? res.clearCookie("connect.sid"): ''
      res.render('../src/routes/comum/enterAuthenticate', {
          csrfToken: req.csrfToken(),
          error: error
      })
    
      res.end()
  })

  // Trades
  app.get("/app/trade/create", function(req, res) {
      res.status(200)
        res.render('../src/routes/comum/trades/createTrade',{
        user: req.session.autorizacao
        })
      res.end()
  })

  app.get("/app/trade/exchange" , function(req,res){
    const SessionKey = req.query.token ?? ''

    if(SessionKey === '', SessionKey.length < 64){
      res.json({
        status: false,
        errorcode: 401
      })
      return res.end()
    }

    const SeachTrade = dbjson.trade("sessionTrade").get("Sessions").find({sessionkey: SessionKey}).value()

    if(typeof SeachTrade === 'undefined'){
      res.json({
        status: false,
        errorcode: 404
      })
      return res.end()
    }

    if(SeachTrade.owner !== req.session.autorizacao && SeachTrade.participant !== null){
      res.json({
        status: false,
        errorcode: 405
      })
      return res.end()
    }

    res.render('../src/routes/trade/exchangeTrade', {
      user: req.session.autorizacao
    })
    res.end()

  })

  // Centro -> A Pagina raiz é a tela de trades.
  app.get("/", function(req, res) {
      var Find = typeof req.query.search !== 'undefined' ? dbjson.search.intrade(dbjson.trade('sessionTrade').get('Sessions'), req.query.search): ''

      var Trades = (data) => {
        var items = []
        for(var Data of data){
          if(Data.owner !== req.session.autorizacao && Data.public === "true"){
            items.push(Data)
          }
        }
        return items
      }

      res.status(200)
      res.render('../src/routes/comum/indexCenter', {
          user: typeof req.session.autorizacao !== 'undefined' ? req.session.autorizacao: false,
          currentTrade: typeof req.query.search === 'undefined' ? Trades(dbjson.trade('sessionTrade').get('Sessions').value()) : Find,
          findTrade: req.query.search,
          Tools: utils
      })
      res.end() 
  })

  // Teste
  app.get("/teste", function(req,res) {
    res.json(dbjson.bets('teste').get('Sessions').value())
    res.end()
  })
}