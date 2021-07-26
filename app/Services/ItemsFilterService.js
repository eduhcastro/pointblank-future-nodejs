const UserFindItemsService = require('./UserFindItemsService')
const userFindItemsService = new UserFindItemsService()

const Tratament = {

    SecsToDays(seconds) {
        seconds = Number(seconds)
        var d = Math.floor(seconds / (3600 * 24))
        var dDisplay = d
        return dDisplay
    }

}

class ItemsFilterService {

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

    async handler(user) {
        const data = await userFindItemsService.handler(user)
        var Weapons = []
        for (var Items of data) {
          this.Weapons.search(Items.item_id, (value) => {
                if (typeof value !== 'undefined') {
                    Weapons.push({
                        id: parseInt(Items.object_id),
                        itemname: value.name,
                        itemcount: Tratament.SecsToDays(parseInt(Items.count)),
                        itemprice: value.price * 3,
                        itemimg: value.img,
                        owneritem: true
                    })
                }
            })
        }
        return Weapons
    }

}

module.exports = ItemsFilterService