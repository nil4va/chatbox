class badgeRepository {
    constructor() {
        this.route = "/badge"
    }

    getBadgeInfo(username) {
        return networkManager
            .doRequest(`${this.route}`, {
                "username": username
            }, "POST");
    }
}