class ChatListRepository {
    constructor() {
        this.route = "/chatList/:naam";
    }

    async create(nameOtherUser, lastMessage, timeStampPreview) {
        return await networkManager
            .doRequest(this.route, {nameOtherUser: nameOtherUser, lastMessage: lastMessage, timeStampPreview: timeStampPreview})
    }
}