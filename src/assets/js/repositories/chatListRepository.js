class ChatListRepository {
    constructor() {
        this.route = "/chatList";
    }

    // async create(nameOtherUser, lastMessage, timeStampPreview) {
    //     return await networkManager
    //         .doRequest(this.route, {
    //             nameOtherUser: nameOtherUser,
    //             lastMessage: lastMessage,
    //             timeStampPreview: timeStampPreview,
    //             userIdLoggedIn: sessionManager.get("username")
    //         })
    // }

    getAll() {
        return networkManager
            .doRequest(this.route, {
                userIdLoggedIn: sessionManager.get("username")
            })
    }

    pinChat(otherUserName) {
        console.log(otherUserName)
        return networkManager
            .doRequest(this.route+"/pin", {
                userIdLoggedIn: sessionManager.get("username"),
                otherUserName: otherUserName,
            })
    }
}
