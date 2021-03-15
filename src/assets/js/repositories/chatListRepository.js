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

    // pinChat(otherUserName) {
    //     console.log(otherUserName)
    //     return networkManager
    //         .doRequest(this.route+"/pin", {
    //             userIdLoggedIn: sessionManager.get("username"),
    //             otherUserName: otherUserName,
    //         })
    // }

    pinChat(otherUserName) {
        const pinlist = sessionManager.get("pinList") || []

        if (!pinlist.includes(otherUserName)){
            pinlist.push(otherUserName)
        } else pinlist.pop(otherUserName)


        sessionManager.set("pinList", pinlist)

        // in de on click achterhalen wat de geklikte user id is
        // via de sessionmanager neerzetten wat het geselecteerde id is
        // als de pagina ingeladen wordt ga je eerst uit de session manager ophalen wat de id is
        // en dan komt het punaise
    }
}
