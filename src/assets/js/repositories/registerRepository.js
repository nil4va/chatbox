class RegisterRepository {
    constructor() {
        this.route = "/register";
    }

    async create(username,password){
        return await networkManager
            .doRequest(this.route,{username: username, password: password});

    }
}