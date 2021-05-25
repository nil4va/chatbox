class badgeRepository {
    constructor() {
        this.route = "/badge"
    }

    async getBadgeInfo(username) {
        await this.evaluateBadges(username)
        return networkManager
            .doRequest(`${this.route}`, {
                "username": username
            }, "POST");
    }

    async evaluateBadges(username) {
        await networkManager.doRequest(`${this.route}/online`, {
            "username": username
        }, "POST");

        await networkManager.doRequest(`${this.route}/popular`, {
            "username": username
        }, "POST");

        await networkManager.doRequest(`${this.route}/fast`, {
            "username": username
        }, "POST");

        await networkManager.doRequest(`${this.route}/og`, {
            "username": username
        }, "POST");

    }
}