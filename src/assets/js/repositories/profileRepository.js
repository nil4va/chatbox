/**
 * This handles all database calls about profiles.
 * @author Maud de Jong
 */
class ProfileRepository {
    constructor() {
        this.route = "/profile";
    }

    // get the firstname, lastname and bio of a certain user
    async getPersonalInfo(username){
        return await networkManager.doRequest(this.route + "/info", {username: username})
    }

    // updates the first name of a user
    async updateFirstName(firstname, username){
        await networkManager.doRequest(this.route + "/firstname", {firstName: firstname, username: username})
    }

    // updates the last name of a user
    async updateLastName(lastname, username){
        await networkManager.doRequest(this.route + "/lastname", {lastName: lastname, username: username})
    }

    // updates the bio of a user
    async updateBio(bio, username){
        await networkManager.doRequest(this.route + "/bio", {bio: bio, username: username})
    }

    // updates the profile picture of a user
    async updateProfilePicture(profilePicture, username){
        let fd = new FormData()
        fd.append("username", username)
        fd.append("profilePicture", profilePicture)
        await networkManager.sendFormData(this.route + "/profilePicture", fd)
    }
}