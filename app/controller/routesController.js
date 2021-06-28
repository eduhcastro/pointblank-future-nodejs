module.exports = function(app, utils) {

  app.set('view engine', 'ejs');

  // Autenticação
  app.get("/app/authenticate", function(req, res) {
      if (utils.check(req.session)) {
          res.redirect('/app/center');
          return res.end()
      }
      res.status(200)
      res.render('../src/routes/comum/enterAuthenticate', {
          csrfToken: req.csrfToken()
      })
      res.end()
  })

  // Trade
  app.get("/app/trade", function(req, res) {

      if (!utils.check(req.session)) {
          res.clearCookie("connect.sid");
          res.redirect('/app/authenticate');
          return res.end()
      }

      res.status(200)
      res.render('../src/routes/comum/indexTrade')
      res.end()
  })

  // Centro
  app.get("/app/center", function(req, res) {

      if (!utils.check(req.session)) {
          res.clearCookie("connect.sid");
          res.redirect('/app/authenticate');
          return res.end()
      }

      res.status(200)
      res.render('../src/routes/comum/indexCenter')
      res.end()
  })
}