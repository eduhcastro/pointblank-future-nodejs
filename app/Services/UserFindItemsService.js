const Postgre = require('../controller/postgreController')

class UserFindItemsService{
  async handler(user){
    const Items = await Postgre.query.Execute("SELECT * FROM player_items WHERE owner_id = $1::int AND equip = $2::int ORDER BY object_id DESC", [user, 1])
    if(Items.rows.length === 0){
      throw Error("Items não encontrados!")
    }
    return Items.rows 
  }
}

module.exports = UserFindItemsService