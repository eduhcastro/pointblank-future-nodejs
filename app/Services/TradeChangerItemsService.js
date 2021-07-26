const Postgres = require('../controller/postgreController')
const DeleteUserItemService = require('./DeleteUserItemService')
const InsertItemToUserService = require('./InsertItemToUserService')
const UpdateItemNotUsageService = require('./UpdateItemNotUsageService')
const UserFindItemService = require('./UserFindItemService')

const deleteUserItemService = new DeleteUserItemService()
const updateItemNotUsageService = new UpdateItemNotUsageService()
const insertItemToUserService = new InsertItemToUserService()
const userFindItemService = new UserFindItemService()

const Treatment = {

    Item: {
        find = async (userid, itemid) => {
            return await userFindItemService.handler(userid, itemid)
        },

        insert = async (user, item, itemname, itemcount, category, equip) => {
            return await insertItemToUserService.handler(user, item, itemname, itemcount, category, equip)
        },

        update = async (count, user, item) => {
            return await updateItemNotUsageService.handler(count, user, item)
        },

        delet = async (user, item) => {
            return await deleteUserItemService.handler(user, item)
        }
    }

}

class TradeChangerItemsService {

    async handler(database, users) {

        const Users = {
            OwnerID: users.ownerid,
            ParticipantID: users.participantid,
            Session: users.session
        }

        for (var Item of database) {

            if (Item.session === session) {
                var SearchItem = await Treatment.Item.find(Item.ownerID, Item.item)

                if (SearchItem.rows.length === 0) {
                    await Treatment.Item.insert(participant, Item.item, "ByChanger", Item.count, 1, 1)
                } else {
                    if (SearchItem.rows[0].equip === 1) {
                        await Treatment.Item.update((SearchItem.rows.count + Item.count), participant, Item.item)
                    }
                }
                await Treatment.Item.delet(parseInt(Item.ownerID), Item.item)
            }
        }
    }
}



module.exports = TradeChangerItemsService