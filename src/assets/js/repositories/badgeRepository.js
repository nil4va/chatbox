/**
 * This handles all database calls about badges.
 *
 * @author Maud de Jong
 */
class badgeRepository {
    constructor() {
        this.route = "/badge"
    }

    // gets all badges of a certain user
    async getBadgeInfo(username) {
        await this.evaluateBadges(username)
        return networkManager
            .doRequest(`${this.route}`, {
                "username": username
            }, "POST");
    }

    // evaluates every badge
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