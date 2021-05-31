class UpdateProfileController{
    constructor() {
        this.profileRepository = new ProfileRepository();
        this.user = sessionManager.get('username');
        $.get('views/updateProfile.html')
            .done(htmlData => this.setup(htmlData))
            .fail(() => this.error())
    }

    async setup(htmlData) {
        this.profileView = $(htmlData);
        $(".content").empty().append(this.profileView);

        const personInfo = (await this.profileRepository.getPersonalInfo(this.user))[0];
        
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


    async updateFirstname(){
        const firstname = $('#inputFirstname').val();
        if (firstname.trim()){
            await this.profileRepository.updateFirstName(firstname, this.user);
        }
    }

    async updateLastname(){
        const lastname = $('#inputLastname').val();
        if (lastname.trim()){
            await this.profileRepository.updateLastName(lastname, this.user);
        }
    }
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