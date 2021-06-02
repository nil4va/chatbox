class ChatListRepository {
    constructor() {
        this.route = "/chatList";
    }

    getAll() {
        return networkManager
            .doRequest(this.route, {
                userIdLoggedIn: sessionManager.get("username")
            })
    }

    getOnlineList() {
        return networkManager
            .doRequest("/isOnlineList", {
            })
    }

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
