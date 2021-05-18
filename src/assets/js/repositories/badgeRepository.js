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
        const online = await networkManager.doRequest(`${this.route}/online`, {
                "username": username
            }, "POST");

        if (online.earned === true){
            await networkManager.doRequest(`/badge/add`, {
                "username": username,
                "badgeNr": 1
            }, "POST");
        } else {
            await networkManager.doRequest(`/badge/remove`, {
                "username": username,
                "badgeNr": 1
            }, "POST");
        }

        const popular = await networkManager.doRequest(`${this.route}/popular`, {
            "username": username
        }, "POST");

        if (popular.earned === true){
            await networkManager.doRequest(`/badge/add`, {
                "username": username,
                "badgeNr": 2
            }, "POST");
        } else {
            await networkManager.doRequest(`/badge/remove`, {
                "username": username,
                "badgeNr": 2
            }, "POST");
        }

        const fast = await networkManager.doRequest(`${this.route}/fast`, {
            "username": username
        }, "POST");

        if (fast.earned === true){
            await networkManager.doRequest(`/badge/add`, {
                "username": username,
                "badgeNr": 3
            }, "POST");
        } else {
            await networkManager.doRequest(`/badge/remove`, {
                "username": username,
                "badgeNr": 3
            }, "POST");
        }

        const og = await networkManager.doRequest(`${this.route}/og`, {
            "username": username
        }, "POST");

        if (og.earned === true){
            await networkManager.doRequest(`/badge/add`, {
                "username": username,
                "badgeNr": 4
            }, "POST");
        } else {
            await networkManager.doRequest(`/badge/remove`, {
                "username": username,
                "badgeNr": 4
            }, "POST");
        }
    }
}