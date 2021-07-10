// Controle de rotas
const routeControl = {

  config: [
    {method: "GET", type: "NORMAL", path: "/",           protected: false, authblock: false},
    {method: "GET", type: "NORMAL", path: "/app/logout", protected: true, authblock: false},
    {method: "GET", type: "NORMAL", path: "/app/authenticate", protected: false, authblock: true},
    {method: "POST",type: "API", path: "/app/authenticate", protected: false, authblock: true},
    {method: "GET", type: "NORMAL", path: "/app/trade", protected: true, authblock: false},
    {method: "POST",type: "API", path: "/app/chat/load", protected: false, authblock: false},
    {method: "POST",type: "API", path: "/app/chat/search",protected: false,authblock: false},
    {method: "POST",type: "API", path: "/app/chat/send", protected: true, authblock: false},
    {method: "GET", type: "NORMAL", path: "/app/trade/create", protected: true, authblock: false},
    {method: "POST",type: "API", path: "/app/trade/create", protected: true, authblock: false},
    {method: "GET", type: "NORMAL",path:"/app/trade/exchange", protected: true, authblock: false},
    {method: "GET", type: "NORMAL",path:"/app/trade/finish", protected: true, authblock: false}
  ],
  
  search: function(method, path, callback){ return callback(this.config.find(function(post, index) {
    if(post.method === method && post.path === path){
      return true
    }
    }));
  }
  
  }

module.exports = {
  routeControl
}