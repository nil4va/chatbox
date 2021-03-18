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
        let pinlist = sessionManager.get("pinList") || []

        if (!pinlist.includes(otherUserName)) {
            pinlist.push(otherUserName)
        }
        sessionManager.set("pinList", pinlist)
    }

    unpinChat(otherUserName) {
        let pinlist = sessionManager.get("pinList")
        if (pinlist.includes(otherUserName)) {
            pinlist.splice(pinlist.indexOf(otherUserName), 1)
        }
        sessionManager.set("pinList", pinlist)
    }
}
