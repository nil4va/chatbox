class ProfileController{
    constructor(person) {
        this.profileRepository = new ProfileRepository();
        this.badgeRepository = new badgeRepository();
        this.person = person === undefined ? sessionManager.get('username') : person;
        $.get('views/profile.html')
            .done(htmlData => this.setup(htmlData))
            .fail(() => this.error())
    }

    async setup(htmlData) {
        this.profileView = $(htmlData);
        $(".content").empty().append(this.profileView);

        const personInfo = await this.profileRepository.getPersonalInfo(this.person);
        $("#name").text(personInfo.firstName === '' ? this.person :
            personInfo.firstName + (personInfo.lastName === '' ? '' : ' ' + personInfo.lastName));
        $(".bio").text(personInfo.bio);

        const earnedBadges = await this.badgeRepository.getBadgeInfo(this.person)
        for (let i = 0; i < earnedBadges.length; i++) {
            const badgeNr = earnedBadges[i].badgeNr
            $('#badge' + badgeNr).hide()
            $('#badgeBorder' + badgeNr).css('opacity', '100%')
        }
        if (this.person === sessionManager.get("username")){
            $('.progressText').text(sessionManager.get('username') + ", you have " + earnedBadges.length + " out of 4 badges right now.");
            $('.progress-bar').css('width',  earnedBadges.length / 4 * 100 + "%");
            if ($(".bio").text() === ''){
                $(".bio").text('You do not have a bio yet, create one by pressing "edit profile"')
            }
            $('#changeProfile').on('click', function () {
                app.loadController(CONTROLLER_UPDATEPROFILE);
            })
        } else {
            $('#changeProfile').hide();
            $('#badgeOverview').hide();

        }

        $('.profilePic').attr("src", "uploads/profile/" + sessionManager.get("username") + ".dat")
        $('.profilePic').on("error", e => {
            $('.profilePic').attr("src", "assets/img/profilepic.jpg")
        })

    }

    error() {
        $(".content").html("failed to load content")
    }
}