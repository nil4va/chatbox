/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author Pim Meijer
 */
class UserRepository {

    constructor() {
        this.route = "/user"
    }

    /**
     * async function that handles a Promise from the networkmanager
     * @param username the username entered
     * @param password the password entered
     * @returns {Promise<user>} username if everything is correct, else a reason for error
     */
    async login(username, password) {
        return await networkManager
            .doRequest(`${this.route}/login`, {"username": username, "password": password}, "POST");
    }
}