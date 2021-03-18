class ProfileRepository {
    constructor() {
        this.route = "/profile";
    }

    async create(firstname, lastname, emailadress, phoneNumber, bio){
        return await networkManager
            .doRequest(this.route,{firstname: firstname, lastname:lastname, emailadress: emailadress, phoneNumber:phoneNumber, bio:bio});

    }
}