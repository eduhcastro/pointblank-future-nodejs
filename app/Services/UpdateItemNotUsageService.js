const Postgre = require('../controller/postgreController')
class UpdateItemNotUsageService{
  async handler(a,b,c){
    await Postgre.query.Execute("UPDATE player_items count = $1::int WHERE owner_id = $2::int AND item_id = $3::int", [a,b,c])
    return true
  }
}

module.exports = UpdateItemNotUsageService