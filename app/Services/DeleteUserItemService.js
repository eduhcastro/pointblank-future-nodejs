const Postgre = require('../controller/postgreController')

class DeleteUserItemService{
  async handler(a,b){
    await Postgre.query.Execute("DELETE FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(a),b])
    return true
  }
}

module.exports = DeleteUserItemService