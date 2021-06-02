class chatListController {
    constructor() {
        $.get("views/chat.html")
            .done((htmlData) => this.setup(htmlData))
            .fail(() => this.error());
    }

    setup(htmlData) {
        this.chatView = $(htmlData)
    }


    error(){
        $(".content").html("Failed to load content")
    }
}