module.exports = class Trade {

  Utils = {

      SecsToDays(seconds) {
          seconds = Number(seconds)
          var d = Math.floor(seconds / (3600 * 24))
          var dDisplay = d
          return dDisplay
      }

  }

  /**
   * Definição de items.
   * Vai ser trabalho por todos os ids das armas e definir o valor.
   * O "price" é o preço da arma por 1 dia. Então 350 * 30
   **/
  Weapons = {
    
    Items: [
      {id: 103232, name: "AUG A3 HALLOWEEN",      category: 1, price: 350, img:"undefined.png"},
      {id: 301162, name: "HALLOWEEN HAMMER",      category: 1, price: 150, img:"undefined.png"},
      {id: 104237, name: "KRISSSUPERV HALLOWEEN", category: 1, price: 250, img:"undefined.png"},
      {id: 105232, name: "Barrett M82A1 Premium", category: 1, price: 568, img:"BARRET_PREMIUM.png"},
      {id: 104132, name: "Kriss S.V Midnight",    category: 1, price: 125, img:"undefined.png"},
      {id: 103405, name: "AUG A3 X-MAS 2017",     category: 1, price: 315, img:"undefined.png"},
      {id: 104534, name: "OA 93 X-MAS 2017",      category: 1, price: 302, img:"undefined.png"}
    ],

      search: function(id, callback) {
          return callback(this.Items.find(function(post, index) {
              if (post.id === id) {
                  return true
              }
          }));
      }

  }

  Items = {

      /**
       * @function Search
       * @description Procura as armas do usuario e transforma em array,
       * via WebSocket
       */
      Search: async (Postgres, query, params) => {
          const data = await Postgres.query.Execute(query, params)
          var Weapons = []
          for (var Items of data.rows) {
              this.Weapons.search(Items.item_id, (value) => {
                  if (typeof value !== 'undefined') {
                      Weapons.push({
                          id: parseInt(Items.object_id),
                          itemname: value.name,
                          itemcount: this.Utils.SecsToDays(parseInt(Items.count)),
                          itemprice: value.price * 3,
                          itemimg: value.img,
                          owneritem: true
                      })
                  }
              })

          }
          return Weapons
      },

      /**
       * @function Changer
       * @description Faz a troca dos items
       */
      Changer: async (Postgres, courrent, owner, participant, session) => {
          for (var Item of courrent) {
              if (Item.session === session) {
                  //console.log('A')
                  if (Item.ownerID === owner) {
                      //console.log('B')
                      var SearchItem = await Postgres.query.Execute("SELECT * FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(Item.ownerID), Item.item])

                      if (SearchItem.rows.length === 0) {
                          //console.log('C')
                          await Postgres.query.Execute("INSERT INTO player_items (owner_id,item_id,item_name,count,category,equip) VALUES($1::int,$2::int,$3::text,$4::int,$5::int,$6::int)", [participant, Item.item, "ByChanger", Item.count, 1, 1])
                      } else {
                          //console.log('D')
                          if (SearchItem.rows[0].equip === 1) {
                              await Postgres.query.Execute("UPDATE player_items count = $1::int WHERE owner_id = $2::int AND item_id = $3::int", [(SearchItem.rows.count + Item.count), participant, Item.item])
                          }
                      }
                      await Postgres.query.Execute("DELETE FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(Item.ownerID), Item.item])
                  } else {
                      //console.log('E')
                      var SearchItem = await Postgres.query.Execute("SELECT * FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(Item.ownerID), Item.item])

                      if (SearchItem.rows.length === 0) {
                          //console.log('F')
                          await Postgres.query.Execute("INSERT INTO player_items (owner_id,item_id,item_name,count,category,equip) VALUES($1::int,$2::int,$3::text,$4::int,$5::int,$6::int)", [owner, Item.item, "ByChanger", Item.count, 1, 1])
                      } else {
                          //console.log('G')
                          if (SearchItem.rows[0].equip === 1) {
                              //console.log('H')
                              await Postgres.query.Execute("UPDATE player_items count = $1::int WHERE owner_id = $2::int AND item_id = $3::int", [(SearchItem.rows.count + Item.count), owner, Item.item])

                          }
                      }
                      await Postgres.query.Execute("DELETE FROM player_items WHERE owner_id = $1::int AND item_id = $2::int", [parseInt(Item.ownerID), Item.item])
                  }

              }
          }
      }


  }
}