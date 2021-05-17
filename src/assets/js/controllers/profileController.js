class ProfileController{

    constructor() {
        this.profileRepository = new ProfileRepository();
        $.get("views/profile.html")
            .done((data) => this.setup((data))
                .fail(() => this.error));
    }
    setup(data) {
        this.createProfileView = $(data);

        this.createProfileView.find(".name").html(sessionManager.get("username"));

        $(".content").empty().append(this.createProfileView);

        this.createProfileView.find(".btn").on("click", (event) => this.onAddEvent(event))

    }

    error() {
        $(".content").html("Failed to load content!");
    }

    async onAddEvent(event) {
        event.preventDefault();
        const firstname = this.createProfileView.find("#inputFirstname").val();
        const lastname = this.createProfileView.find("#inputLastname").val();
        const emailadress = this.createProfileView.find("#inputEmailadress").val();
        const phoneNumber = this.createProfileView.find("#inputPhoneNumber").val();
        const bio = this.createProfileView.find("#inputBio").val();


        try{
            const registerId = await this.profileRepository.create(firstname, lastname, emailadress, phoneNumber, bio);
            app.loadController(CONTROLLER_PROFILE);
        } catch (e) {
            console.log(e);
        }
    }
}

addEventListener('CONTENT_LOAD', e => {
    let userID = HBO-ICTCloud.session.get("id")
})

// $(document).ready(function() {
//
//
//     var readURL = function(input) {
//         if (input.files && input.files[0]) {
//             var reader = new FileReader();
//
//             reader.onload = function (e) {
//                 $('.profile-pic').attr('src', e.target.result);
//             }
//
//             reader.readAsDataURL(input.files[0]);
//         }
//     }
//
//
//     $(".file-upload").on('change', function(){
//         readURL(this);
//     });
//
//     $(".upload-button").on('click', function() {
//         $(".file-upload").click();
//     });
// });