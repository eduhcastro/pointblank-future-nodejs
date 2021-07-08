var domain = "http://localhost:8080"

$(function () {
  $('[data-toggle="tooltip"]').tooltip({html:true})
})

$(".btn.btn-warning.me-2").click(function(){
  window.location.replace("/app/authenticate")
})

$(".dropdown-item.logout").click( (e)=>{
  $.post(`${domain}/app/logout`, function(){
    location.reload()
  }) 
})
