class Trade {
    Web = "http://localhost:8080"
    Count = 0
    Routes = {
        GetItems:   `${getParameterByName('token')}::getItems`, // OwnerItems: `${getParameterByName('token')}::owneritems`,
        AddItems :  `${getParameterByName('token')}::addItems`, // Adicionar items ao trade, troca.
        ReciveItems:`${getParameterByName('token')}::reciveItems`,
        RemoveItems:`${getParameterByName('token')}::removeItems`,
        Disconnect: `${getParameterByName('token')}::Disconnect`, // Emit de usuario desconectado
    }

    Render = {

        ItemsRecived: (items, owner) => {

            var ItemsUser = {}

            ItemsUser.renderPrize = function(id, nome, count, img, dono, price, reciveUser) {
                var tpl = "";
                tpl += `<div data-v-13d367a4="${id}" data-weaponiden= "${id}"class="item chifre" style="background-image: url('/components/trade/imgs/items/${img}');">`;
                tpl += '	<span data-v-13d367a4=""  data-timeowner="' + count + '" class="tl">' + count + ' DAYS</span>';
                tpl += `<span data-v-13d367a4="" data-priceowner="${price}" class="p">${formatter.format(price)}</span>`;
                tpl += '<span data-v-13d367a4="" data-nameowner="' + nome + '" class="ex">' + nome + '</span>';
                tpl += '</div>';
                if (reciveUser !== User) {
                    $(".panel-block.items.is-paddingless.xyz").append(tpl);
                } else {
                    $(".panel-block.items.owner").append(tpl);
                }
            }

            items.forEach(function(item) {
                ItemsUser.renderPrize(
                    item.id,
                    item.itemname,
                    item.itemcount,
                    item.itemimg,
                    item.owneritem,
                    item.itemprice,
                    owner
                )
            })
        },

        UserStatus: (type, user) => {

            StopIntervall(CountParticipante)
            if (type === "Leave") {
                if (user.level === 0) {

                    if (user.user === 1) {
                        console.log('Participante saiu normalmente')
                        $(".panel-block.items.is-paddingless.xyz").empty();
                        $('#cagado').find('span').remove()
                        $('#cagado').find('img').remove()
                        $('#cagado').append('<span class="awaituser" id="AwaitUser"> Aguardando um participante...</span>')
                        $('#cagado').append('<img src="https://d18xl8ggo6ud4h.cloudfront.net/wp-content/uploads/2019/04/loading.fef1f20.gif" class="gifawaituser" id="AwaitUserImg">')
                    }

                    if (user.user === 0) {
                        console.log('O Dono saiu normalmente')
                        window.location.href = "/ownerout"
                    }
                }

            }


            if (type === "Enter") {
                console.log('Participante Entrou')
                $('#cagado').find('span').remove()
                $('#cagado').find('img').remove()
                $('#cagado').append('<span style="margin-top: 38%;position: absolute;margin-left: 30%;font-size: 20px;">O Usuario #' + user + ' entrou</span><span id="timeawait" style="margin-top: 42%;position: absolute;margin-left: 42%;font-size: 15px;">Iniciando em 3</span>')
                $('#cagado').append('<img src="/components/trade/imgs/gifs/Done.gif" style="position: absolute;margin-top: 41%;margin-left: 38%;width: 150px;">')
                var counter = 3
                var CountParticipante = setInterval(() => {
                    counter--;
                    if (counter === 0) {
                        $('#timeawait').html('Iniciando em ' + counter + '');
                        StopIntervall(CountParticipante)
                        $("#cagado").css("display", "none")
                        return;
                    } else {
                        $('#timeawait').html('Iniciando em  ' + counter + '');
                    }
                }, 800);
            }
        },

        SortAndSearch: () => {
            $('#SortItens').on('change', function() {
                var sortByValue = this.value;
                $('.panel-block.items.owner div').animate({
                    opacity: "0.0"
                })
                setTimeout(function() {
                    if (sortByValue == '0') {
                        $('.panel-block.items.owner div').sort(function(a, b) {
                            return $(b).children("span.p").attr("data-priceowner") - $(a).children("span.p").attr("data-priceowner");
                        }).appendTo('.panel-block.items.owner')
                        $('.panel-block.items.owner div').animate({
                            opacity: "1.0"
                        });
                    }
                    if (sortByValue == '1') {
                        $('.panel-block.items.owner div').sort(function(a, b) {
                            return $(a).children("span.p").attr("data-priceowner") - $(b).children("span.p").attr("data-priceowner");
                        }).appendTo('.panel-block.items.owner')
                        $('.panel-block.items.owner div').animate({
                            opacity: "1.0"
                        });
                    }
                    if (sortByValue == '2') {
                        $('.panel-block.items.owner div').sort(function(a, b) {
                            return $(b).children("span.tl").attr("data-timeowner") - $(a).children("span.tl").attr("data-timeowner")
                        }).appendTo('.panel-block.items.owner')
                        $('.panel-block.items.owner div').animate({
                            opacity: "1.0"
                        });
                    }
                    if (sortByValue == '3') {
                        $('.panel-block.items.owner div').sort(function(a, b) {
                            return $(a).children("span.tl").attr("data-timeowner") - $(b).children("span.tl").attr("data-timeowner");
                        }).appendTo('.panel-block.items.owner')
                        $('.panel-block.items.owner div').animate({
                            opacity: "1.0"
                        });
                    }
                }, 450);
            })
        
            $("#SearchOwner").on("keyup", function() {
                var search = $(this).val().toUpperCase()
                $(".panel-block.items.owner div").each(function() {
                    var nameweapon = $(this).children("span.ex").attr("data-nameowner")
                    if (nameweapon.search(new RegExp(search, "i")) < 0) {
                        $(this).fadeOut();
                    } else {
                        $(this).show();
                    }
                })
            })
        },

        MirrorItem(data){
            if (data.owner !== User) {
                $('*[data-weaponiden="' + data.id + '"]').appendTo(".panel-block.items.is-paddingless.frineditems")
                $("#CountItemMoneyFriend").text(`${data.count} items - $${data.value}.00`)
            }
        },

        MirrorItemRemove(data){
            if (data.owner !== User) {
                $('*[data-weaponiden="' + data.id + '"]').appendTo(".panel-block.items.is-paddingless.xyz")
                $("#CountItemMoneyFriend").text(`${data.count} items - $${data.value}.00`)
            }
        }
    }

    Actions = {

        AddItem(self, App){
            $('.panel-block.items.owner').on('click', '.item.chifre', function(e) {
                if (self.Count > 0) { // > 1
                    var QI = $("#youroferitemmoney1").text()
                    var item = parseInt(QI) + 1
                    App.emit(self.Routes.AddItems, {
                        item: $(e.currentTarget).attr("data-weaponiden"),
                        count: item,
                        type: 0
                    })
                    $(e.currentTarget).appendTo(".panel-block.items.is-paddingless.youoffer");
                    var valueitems = parseInt($(e.currentTarget).children("span.p").attr("data-priceowner")) + parseInt($("#youroferitemmoney2").text())
                    $("#youroferitemmoney1").text(item)
                    $("#youroferitemmoney2").text(valueitems)
                }
            })
        },

        RemoveItem(self, App){
            $('.panel-block.items.is-paddingless.youoffer').on('click', '.item.chifre', function(e) {
                var QI = $("#youroferitemmoney1").text()
                var item = parseInt(QI) - 1
                App.emit(self.Routes.RemoveItems, {
                    user: User,
                    item: $(e.currentTarget).attr("data-weaponiden"),
                    count: item,
                    type: 1
                })
                $(e.currentTarget).appendTo(".panel-block.items.owner");
                var valueitems = parseInt($("#youroferitemmoney2").text()) - parseInt($(e.currentTarget).children("span.p").attr("data-priceowner"))
                $("#youroferitemmoney1").text(item)
                $("#youroferitemmoney2").text(valueitems)
            })
        }
    }


    init() {
        var Self = this
        var App = io(this.Web)

        App.on('connect', function(self = Self) {
            self.Count++

            /**
             * Injetando items no cliente, para os dois usuarios
             */
            App.on(self.Routes.GetItems, function(items) {
                if (items.owner !== User) {
                    self.Render.UserStatus("Enter", items.owner)
                }
                self.Render.ItemsRecived(items.items, items.owner)
            })

            /**
             * Espelhando os items adicionados
             */
            App.on(self.Routes.ReciveItems, function(dados){
                self.Render.MirrorItem(dados)
            })

            /**
             *  Espelhando os items removidos
             */
             App.on(self.Routes.RemoveItems, function(dados){
                self.Render.MirrorItemRemove(dados)
            })
             

            /**
             * Enviando dados para a sessão, de cada usuario desconectado.
             */
            App.on(self.Routes.Disconnect, function(dados) {
                self.Count--
                self.Render.UserStatus("Leave", dados)
            })

        })
        this.Render.SortAndSearch()
        this.Actions.AddItem(Self, App)
        this.Actions.RemoveItem(Self, App)
    }

}

$(document).ready(function() {
    new Trade().init()
})