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
        this.updateProfilePicture()

        $('#saveProfile').on('click', async () => {
            this.updateFirstname().then(
                this.updateLastname().then(
                    this.updateBio().then(
                        app.loadController(CONTROLLER_PROFILE))));
        })

        $("#image").click(function() {
            $("input[id='my_file']").click();
        });

        my_file.onchange = async e => {
            const [file] = my_file.files
            if (file) {
                $('#image').attr("src", "uploads/profile/" + this.user + ".dat")

                await this.profileRepository.updateProfilePicture(file, this.user)
                this.updateProfilePicture()
            }
        }
    }

    async updateProfilePicture() {
        const profilePicture = $('#image')
        profilePicture.attr("src", "uploads/profile/" + this.user + ".dat")
        profilePicture.on("error", e => {
            profilePicture.attr("src", "assets/img/profilepic.jpg")
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