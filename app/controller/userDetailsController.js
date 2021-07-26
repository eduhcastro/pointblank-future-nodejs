const Postgres = require('./postgreController')
class userDetailsController{

  async personalization(user){
    const data = await Postgres.query.Execute("SELECT * FROM zevolution_users WHERE userlogin = $1::text", [user])
    return data.rows
  }

  async details(user){
    const data = await Postgres.query.Execute("SELECT * FROM accounts WHERE login = $1::text", [user])
    return data.rows
  }

}

module.exports = {userDetailsController}