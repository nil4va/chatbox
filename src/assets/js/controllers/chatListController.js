import ChatRepository from '../repositories/chatRepository.js'

class ChatListController {
    constructor() {
        this.chatRepository = new ChatRepository('test', 'server')
        $.get("views/chat.html")
            .done((htmlData) => this.setup(htmlData))
            .fail(() => this.error());
        this.init()
    }

    async init() {


    }

    setup(htmlData){
        this.chatListView = $(this.chatListView);
        $(".chatList").empty().append(this.chatListView);
    }

    error(){
        $(".chatList").html("Failed to load content")
    }

    previewData() {
        const nameOtherUser = this.chatListView.find(".userName").val();
        const lastMessage = this.chatListView.find(".lastMessage").val();
        const timeStampPreview = this.chatListView.find(".timeStamp").val();

        console.log(`${nameOtherUser} - ${lastMessage} - ${timeStampPreview}`)

        try{
            this.chatRepository.create(nameOtherUser, lastMessage, timeStampPreview);
        } catch (e) {
            console.log(e)
        }
        // const username = this.loginView.find("[name='username']").val()
        // const otherUser = "SELECT to FROM message WHERE from = ?, [username]"
    }

    // lastMessage() {
    //     const lastMessage = this.chatRepository.getAll().slice(-1)[0]
    //     qs('.lastMessage').append(
    //         `<p>${lastMessage}</p>`
    //     );
    // }
    //
    // timeStampPreview() {
    //     const timestampLastMessage = "SELECT timestamp FROM message WHERE content = ?, [lastMessage]"
    // }
}
