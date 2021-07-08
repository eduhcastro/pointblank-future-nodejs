$(window).on('load', function() {
  const domain = "http://localhost:8080"
  const colors = ["linear-gradient(to bottom, #33ccff 0%, #ff99cc 100%)", "linear-gradient(to right, red , yellow)", "linear-gradient(to bottom, #000099 0%, #ff99cc 100%)", "linear-gradient(to bottom, #00cc66 0%, #ff99cc 100%)", "linear-gradient(to bottom, #9900cc 0%, #ff99cc 100%)", "linear-gradient(to bottom, #ffcc00 0%, #ff99cc 100%)", "linear-gradient(to bottom, #ffffff 0%, #ff99cc 100%)", "linear-gradient(to bottom, #ff00ff 0%, #6699ff 100%)", "linear-gradient(to bottom, #99ff66 0%, #6699ff 100%)"]


  $(".category-imgs > img").click(function() {
      if (typeof $(this).attr('class') === 'undefined' || $(this).attr('class') === '') {
          $(".category-imgs.item").append('<img src="' + $(this).attr('src') + '">')
          return $(this).addClass("selected")
      }
      $(".category-imgs.item > img[src$='" + $(this).attr('src') + "']").remove()
      return $(this).removeClass("selected")
  })

  $(".icons-imgs > img").click(function() {
      $(".icons-imgs > img").removeClass("selected")
      $(".modal-items-item > div > img.miniature").attr('src', $(this).attr('src'))
      return $(this).addClass("selected")
  })

  $("#Title-input").keyup(function() {
      $("div.title > h3").text($(this).val())
  })

  $("#Input-description").keyup(function() {
      $(".rounded-circle.avatar").attr("data-bs-original-title", "<b style='color: #ffc659'>" + user + "</b><br><span>" + $(this).val() + "</span>")
  })



  $(".pagination.pagination-lg > a").click(function() {
      $(".pagination.pagination-lg > a > li").removeClass("active")
      $(this).children().addClass("active")
      $(".modal-items-item").css("background", colors[parseInt($(this).attr("data-background"))])
  })

  $('#Input-public-check').click(function() {
      $(".alert.alert-warning.public").toggle(!this.checked);
  })

  $(".w-100.btn.btn-lg.btn-primary").click( function(){
    const Title = $("#Title-input").val()
    const Category = $(".category-imgs > img.selected")
    const SaveCategory = []
    const Description = $("#Input-description").val()
    const ThumbNail = $(".icons-imgs > img.selected")
    const Background = $(".pagination.pagination-lg > a > li.page-item.active")
    const Public = $("#Input-public-check").is(':checked')

    if(typeof Title === 'undefined' ||
      Title === '' ||
      Title.length < 1 ||
      Title.length > 50)
    {
      return alert('Input title invalid')
    }

    if(typeof Category === 'undefined' ||
      Category === '' ||
      Category.length === 0)
    {
      return alert('Select a category')
    }

    Category.each(function(){
      SaveCategory.push(parseInt($(this).attr('data-category')))
    })

    if(typeof Description === 'undefined' ||
      Description === '' ||
      Description.length < 1 ||
      Description.length > 50)
    {
        return alert('Input description invalid')
    }

    if(typeof ThumbNail === 'undefined' ||
    ThumbNail === '' ||
    ThumbNail.length > 1  ||
    ThumbNail.attr("data-thumb") === 'undefined' ||
    parseInt(ThumbNail.attr("data-thumb")) > 6 ||
    parseInt(ThumbNail.attr("data-thumb")) < 1)
    {
      return alert('Select One ThumbNail.')
    }

    if(typeof Background === 'undefined' ||
      Background === ''     ||
      Background.length > 1 ||
      Background.length === 0 ||
      parseInt(Background.text()) > 9
    ){
      return alert('Selecet One Background.')
    }

    if(typeof Public === 'undefined' ||
       typeof Public !== 'boolean'   ||
       Public === '')
    {
      return alert('Public not defined')
    }



    $.post("/app/trade/create",{
      title: Title,
      categorys: SaveCategory,
      description: Description,
      thumbnail: parseInt(ThumbNail.attr("data-thumb")),
      background: parseInt(Background.text()),
      public: Public
    }, function(e){
      if(!e.status){
        return alert("it was not possible to create a trade")
      }
      if(Public === 'true'){
        alert("Copy the link and send to your frined")
        window.open(domain+"/app/trade/exchange/"+e.sessionkey)
        return window.location.replace(domain);
      }
      window.open(domain+"/app/trade/exchange/"+e.sessionkey)
      return window.location.replace(domain)
  })

})

})