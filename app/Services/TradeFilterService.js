const UserFindEvolutionService = require("./UserFindEvolutionService")
const userFindEvolutionService = new UserFindEvolutionService()

class TradeFilterService{

  async handler(data, user){
    let Sessoes = []
    for(var Sessao of data){
      if(Sessao.owner !== user && Sessao.public === "true" && Sessao.participant === null){
        var UserDetails = await userFindEvolutionService.handler(Sessao.owner)
        Sessoes.push({
          id: 1,
          name: Sessao.name,
          sessionkey: Sessao.sessionkey,
          owner: Sessao.owner,
          personalization: {
            categorys: Sessao.personalization.categorys,
            background: Sessao.personalization.background,
            description: Sessao.personalization.description,
            thumbnail: Sessao.personalization.thumbnail
          },
          userDetails: {
            picture: UserDetails[0].picture,
            rank:    UserDetails[0].level
          }
        })
      }
    }
    return Sessoes
  }
}

module.exports = TradeFilterService