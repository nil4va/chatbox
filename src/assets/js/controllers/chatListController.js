class chatListController {
    constructor() {
        $.get("views/chat.html")
            .done((htmlData) => this.setup(htmlData))
            .fail(() => this.error());
    }

    setup(htmlData) {
        this.chatView = $(htmlData)
        this.chatView.find(".previewChat").on("click", e => console.log("click!"))
    }


    error(){
        $(".content").html("Failed to load content")
    }
}