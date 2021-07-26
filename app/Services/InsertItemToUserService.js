const Postgre = require('../controller/postgreController')

class InsertItemToUserService{
  async handler(a,b,c,d,e,f){
    await Postgre.query.Execute("INSERT INTO player_items (owner_id,item_id,item_name,count,category,equip) VALUES($1::int,$2::int,$3::text,$4::int,$5::int,$6::int)", [a,b,c,d,e,f])
    return true
  }
}

module.exports = InsertItemToUserService