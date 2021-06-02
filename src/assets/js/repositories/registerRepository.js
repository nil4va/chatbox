/**
 * This handles all database calls about registering and logging in.
 * @author Maud de Jong
 */
class RegisterRepository {
    constructor() {
        this.route = "/register";
    }

    // creates a user
    async create(username, email, password) {
        return await networkManager
            .doRequest(this.route + '/add', {username: username, email: email, password: password});

    }

    // checks if the username is already in use
    async checkName(username) {
        return await networkManager.doRequest(this.route + '/name', {username: username});
    }

    // checks if the email is already in use
    async checkMail(email) {
        return await networkManager.doRequest(this.route + '/mail', {email: email});
    }
}