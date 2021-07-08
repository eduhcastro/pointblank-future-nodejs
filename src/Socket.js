const TradesClass = new(require('../app/class/tradeClass'))
module.exports = async function(io, dbjson, mysql) {

    io.sockets.on('connect', async function(socket) {

        if (typeof socket.handshake.session.autorizacao === 'undefined') {
            console.log("Nao foi encontrada uma Sessão WEBSOCKET")
            return socket.disconnect()
        }

        const Trade = socket.handshake.headers.referer.split("?token=")
        const User = socket.handshake.session.autorizacao
        const UserID = socket.handshake.session.autorizacaoid

        if (typeof Trade[1] === 'undefined') {
            console.log("Não foi definida uma trade sessão WEBSOCKET")
            return socket.disconnect()
        }

        const DatabaseJson = dbjson.trade("sessionTrade").get("Sessions").find({
            sessionkey: Trade[1]
        }).value()

        if (typeof DatabaseJson === 'undefined') {
            console.log("Trade não encontrada WEBSOCKET")
            return socket.disconnect()
        }

        if (DatabaseJson.owner !== User && DatabaseJson.participant !== null) {
            console.log("Não foi possivel entrar na Trade WEBSOCKET")
            return socket.disconnect()
        }

        const Participante = DatabaseJson.participant
        const Dono = DatabaseJson.owner
        const DonoID = DatabaseJson.ownerid

        /**
         * Pré Definicições do dono da trade👥
         **/
        if (DatabaseJson.owner === User) {

            io.emit(`${Trade[1]}::getItems`, {
                items: await TradesClass.Items.Search(mysql, "SELECT * FROM player_items WHERE owner_id = $1::int AND equip = $2::int ORDER BY object_id DESC", [UserID, 1]),
                owner: User
            })

            console.log(`O Dono da trade Entrou! [${Trade[1]}]`)
            dbjson.trade("sessionTrade").get("Sessions").find({
                sessionkey: Trade[1]
            }).assign({
                online: DatabaseJson.online + 1
            }).write() // Somando o online + 1
        } else

            /**
             * Pré Definicições do participante da trade👥
             **/
            if (Participante === null) {
                dbjson.trade("sessionTrade").get("Sessions").find({
                    sessionkey: Trade[1]
                }).assign({
                    participant: User
                }).write() // Inserindo o participante na trade

                /**
                 * Enviando o item do participante para ele mesmo e para o dono da trade
                 */
                io.emit(`${Trade[1]}::getItems`, {
                    items: await TradesClass.Items.Search(mysql, "SELECT * FROM player_items WHERE owner_id = $1::int AND equip = $2::int ORDER BY object_id DESC", [UserID, 1]),
                    owner: User
                })

                io.to(socket.id).emit(`${Trade[1]}::getItems`, {
                    items: await TradesClass.Items.Search(mysql, "SELECT * FROM player_items WHERE owner_id = $1::int AND equip = $2::int ORDER BY object_id DESC", [DonoID, 1]),
                    owner: Dono
                })

                console.log(`O Participante entrou na trade! [${Trade[1]}]`)
                dbjson.trade("sessionTrade").get("Sessions").find({
                    sessionkey: Trade[1]
                }).assign({
                    online: DatabaseJson.online + 1
                }).write() // Somando o online + 1
            } else {
                console.log("Não é possivel participar da trade pois outro usuario já esta nela")
                return socket.disconnect()
            }

        socket.on(`${Trade[1]}::addItems`, (data) => {
            const ItemsCourrent = dbjson.trade("courrentTrade").get("TradeCourrent")
            // if(DatabaseJson.participant !== null){

            /**
             * Adicionando o item do usuario ao Trade courrent
             */
            ItemsCourrent.push({
                id: parseInt(data.item),
                item: parseInt(data.item),
                count: parseInt(data.count),
                owner: User,
                type: data.type,
                session: Trade[1]
            }).write()

            /**
             * Enviando os items de volta ao cliente
             */
            io.emit(`${Trade[1]}::reciveItems`, {
                id: ItemsCourrent.find({
                    session: Trade[1],
                    item: parseInt(data.item)
                }).value().id,
                item: parseInt(data.item),
                count: parseInt(data.count),
                values: 123,
                owner: User,
                type: data.type,
            })
        })

        socket.on(`${Trade[1]}::removeItems`, (data) => {
            const ItemsCourrent = dbjson.trade("courrentTrade").get("TradeCourrent")

            if (typeof ItemsCourrent.find({
                    id: parseInt(data.item),
                    owner: User
                }).value() !== undefined) {
                ItemsCourrent.remove({
                    id: parseInt(data.item),
                    owner: User
                }).write() // Removendo item da Sessao File

                io.emit(`${Trade[1]}::removeItems`, {
                    id: parseInt(data.item),
                    count: 0,
                    owner: User,
                    value: 0
                })
            } else {
                console.log("Não é possivel retirar um item que nao esta presente")
                return socket.disconnect()
            }
        })

        socket.on("disconnect", () => {

            if (typeof DatabaseJson !== 'undefined') {
                dbjson.trade("sessionTrade").get("Sessions").find({
                    sessionkey: Trade[1]
                }).assign({
                    online: DatabaseJson.online--
                }).write()
                if (DatabaseJson.owner === User) {
                    io.emit(`${Trade[1]}::Disconnect`, {
                        level: 0,
                        user: 0
                    })
                    console.log(`O Dono da trade Saiu! [${Trade[1]}]`)
                    //dbjson.trade("sessionTrade").get("Sessions").find({sessionkey: Trade[1]}).remove() // Caso o dono saia da trade, ela deve ser excluida
                } else {
                    io.emit(`${Trade[1]}::Disconnect`, {
                        level: 0,
                        user: 1
                    })
                    console.log(`O Participante saiu! [${Trade[1]}]`)
                    dbjson.trade("sessionTrade").get("Sessions").find({
                        sessionkey: Trade[1]
                    }).assign({
                        participant: null
                    }).write()
                }

            }

        })

    })

}