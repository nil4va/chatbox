/**
 * Repository responsible for all user data from server
 * Make sure all functions are using the async keyword when interacting with network!
 * @author Pim Meijer
 */

class UserRepository {
    constructor() {
        //TODO: get url from config
        this.url = "http://localhost:3000/user"
    }

    async getAll() {

    }

    /**
     * async function that handles a Promise from the networkmanager
     * @param username
     * @param password
     * @returns {Promise<user>}
     */
    async login(username, password) {
        return await appInstance().networkManager
            .doRequest(`${this.url}/login`, {"username": username, "password": password});
    }

    async delete() {

    }

    async update(id, values = {}) {

    }
}