class RegisterRepository {
    constructor() {
        this.route = "/register";
    }

    async create(username,email, password){
        return await networkManager
            .doRequest(this.route + '/add',{username: username, email: email, password: password});

    }

    async checkName(username){
        return await networkManager.doRequest(this.route + '/name', {username: username});
    }

    async checkMail(email){
        return await networkManager.doRequest(this.route + '/mail', {email: email});
    }
}