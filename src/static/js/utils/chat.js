var domain = "http://localhost:8080"
const Chat = {

  injectMessage: (data) => {
    if($(".card-body.chat > div.message").children().length > 20){
      for(var i = $(".card-body.chat > div.message").children().length; i > 20; i--){
        if(i > 20){
          $(".card-body.chat > div.message").find('div:first').remove();
        }
      }
    }

    for(var Items of data){
      if(typeof $('*[data-message="'+Items.id+'"]').html() === 'undefined'){
        $(".card-body.chat > div.message").append(`<div data-message="${Items.id}" class="message-container"><div class="avatar"><img src="${Items.picture}" alt=""/></div><div class="message"><span class="rank"><div class="bg master"><img src="/images/ranks/bronze.png" alt="Rust - lvl 17" class="badge"/> <div class="level">${Items.level}</div> </div></span><span class="username">${Items.name}</span> <span class="message">${Items.message}</span></div></div>`)
      }
    }
  },

  searchMessage: () => {
    $.post(`${domain}/app/chat/search`, function(data){
      return Chat.injectMessage(data)
    })
  },

  sendMessage: (message) => {
    $.post(`${domain}/app/chat/send`,{message: message}, function(data){
      if(!data.status){
        return alert('Login first!')
      }
      console.log('Message sent')
      })
  },

  loadMessages: () => {

      $.post(`${domain}/app/chat/load`, 
          function(data){
          for(var Messages of data){
          $(".card-body.chat > div.message").append(`<div data-message="${Messages.id}" class="message-container"><div class="avatar"><img src="${Messages.picture}" alt=""/></div><div class="message"><span class="rank"><div class="bg master"><img src="/images/ranks/bronze.png" alt="Rust - lvl 17" class="badge"/> <div class="level">${Messages.level}</div> </div></span><span class="username">${Messages.name}</span> <span class="message">${Messages.message}</span></div></div>`)
          }
      })
    }

}

$(".form-control.send").keyup(function(e){
  if((e.keyCode || e.which) == 13) {
    const Mensagem = $('.form-control.send').val()
    $('.form-control.send').val('')
    if($('.form-control.send').val().length === 1){
      return alert('Type something first!')
    }
    return Chat.sendMessage(Mensagem)
  }
})

$(window).on('load', function() {
  setInterval(function(){ 
    Chat.searchMessage()
  }, 10000)
  Chat.loadMessages()
 })
