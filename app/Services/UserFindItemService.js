const Postgre = require('../controller/postgreController')

class UserFindItemService{
  async handler(user, item){
    const Items = await Postgre.query.Execute("SELECT * FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(user), item])
    if(Items.rows.length === 0){
      throw Error("Item especifico não encontrados!")
    }
    return Items 
  }
}

module.exports = UserFindItemService