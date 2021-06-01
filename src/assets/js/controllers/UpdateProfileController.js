/**
 * Profile update Controller: the controller behind the profile update page.
 * inputs old profile data when loaded and saves the new data to the database
 * when the save button is pressed
 */
class UpdateProfileController{
    constructor() {
        this.profileRepository = new ProfileRepository();
        this.user = sessionManager.get('username');

        $.get('views/updateProfile.html')
            .done(htmlData => this.setup(htmlData))
            .fail(() => this.error())
    }

    /**
     * Initializes values input fields and makes sure that when save is pressed, the values
     * are saved to the database and the user is directed back to the profile page.
     */
    async setup(htmlData) {
        this.profileView = $(htmlData);
        $(".content").empty().append(this.profileView);

        const personInfo = await this.profileRepository.getPersonalInfo(this.user);

        $('#inputFirstname').val(personInfo.firstName);
        $('#inputLastname').val(personInfo.lastName);
        $("#inputBio").val(personInfo.bio);

        $('#saveProfile').on('click', async () => {
            this.updateFirstname().then(
                this.updateLastname().then(
                    this.updateBio().then(
                        app.loadController(CONTROLLER_PROFILE))));
        })
    }

    /**
     * gets the first name value from the input field and when it isn't empty
     * updates it in the database
     * @returns {Promise<void>} returns when finished
     */
    async updateFirstname(){
        const firstname = $('#inputFirstname').val();
        if (firstname.trim()){
            await this.profileRepository.updateFirstName(firstname, this.user);
        }
    }

    /**
     * gets the last name value from the input field and when it isn't empty
     * updates it in the database
     * @returns {Promise<void>} returns when finished
     */
    async updateLastname(){
        const lastname = $('#inputLastname').val();
        if (lastname.trim()){
            await this.profileRepository.updateLastName(lastname, this.user);
        }
    }

    /**
     * gets the bio value from the input field and when it isn't empty
     * updates it in the database
     * @returns {Promise<void>} returns when finished
     */
    async updateBio(){
        const bio = $('#inputBio').val();
        if (bio.trim()){
            await this.profileRepository.updateBio(bio, this.user);
        }
    }

    error() {
        $(".content").html("failed to load content")
    }
}