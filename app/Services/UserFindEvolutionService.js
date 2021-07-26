const Postgre = require('../controller/postgreController')

class UserFindEvolutionService{

  async handler(user){
    const User = await Postgre.query.Execute("SELECT * FROM zevolution_users WHERE userlogin = $1::text", [user])
    if(User.rows.length === 0){
      throw new Error("USUARIO DESCONHECIDO")
    }
    return User.rows
  }

}

module.exports = UserFindEvolutionService