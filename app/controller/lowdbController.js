const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const DBJson = {

    trade: (select) => {
    const file = new FileSync(`./app/data/trade/${select}.json`)
    const db = low(file);
    return db;
    },

    bets: (select) => {
    const file = new FileSync(`./app/data/bets/${select}.json`)
    const db = low(file);
    return db;
    },

    chat: (select) => {
        const file = new FileSync(`./app/data/chat/${select}.json`)
        const db = low(file);
        return db;
    },

    search: {

        intrade: (trades, keyword) => {
            var Find = []
            var KeyRGXP = new RegExp(keyword, "g")

            for(var Items of trades.value()){
                var ByOwner = Items.owner.split(" ")
                ByOwner.filter(function(word,index){
                    if(word.match(KeyRGXP)){
                        Find.push(Items)
                        return true
                    }else{
                        return false
                    }
                })
            }

            for(var Items of trades.value()){
                var ByOwner = Items.name.split(" ")
                ByOwner.filter(function(word,index){
                    if(word.match(KeyRGXP)){
                        Find.push(Items)
                        return true
                    }else{
                        return false
                    }
                })
            }

        if(Find.length > 0){
            var Result = Find.reduce((unique, o) => {
                if(!unique.some(obj => obj.sessionkey === o.sessionkey)) {
                  unique.push(o)
                }
                return unique
            },[])
            return Result
        }

        return Find

    }

}


}



module.exports = DBJson





