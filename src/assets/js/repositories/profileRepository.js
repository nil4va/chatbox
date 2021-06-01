class ProfileRepository {
    constructor() {
        this.route = "/profile";
    }

    async create(firstname, lastname, emailadress, phoneNumber, bio){
        return await networkManager
            .doRequest(this.route,{firstname: firstname, lastname:lastname, emailadress: emailadress, phoneNumber:phoneNumber, bio:bio});

    }

    async getPersonalInfo(username){
        return await networkManager.doRequest(this.route + "/info", {username: username})
    }

    async updateFirstName(firstname, username){
        await networkManager.doRequest(this.route + "/firstname", {firstName: firstname, username: username})
    }
    async updateLastName(lastname, username){
        await networkManager.doRequest(this.route + "/lastname", {lastName: lastname, username: username})
    }
    async updateBio(bio, username){
        await networkManager.doRequest(this.route + "/bio", {bio: bio, username: username})
    }

    async updateProfilePicture(profilePicture, username){
        let fd = new FormData()
        fd.append("username", username)
        fd.append("profilePicture", profilePicture)
        await networkManager.sendFormData(this.route + "/profilePicture", fd)
    }
}