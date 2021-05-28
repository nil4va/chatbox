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

        const personInfo = (await this.profileRepository.getPersonalInfo(this.person))[0];
        $("#name").text(personInfo.voornaam === '' ? this.person :
            personInfo.voornaam + (personInfo.achternaam === '' ? '' : ' ' + personInfo.achternaam));
        $(".bio").text(personInfo.bio);

        const earnedBadges = await this.badgeRepository.getBadgeInfo(this.person)
        for (let i = 0; i < earnedBadges.length; i++) {
            const badgeNr = earnedBadges[i].badgeNr
            $('#badge' + badgeNr).hide()
            $('#badgeBorder' + badgeNr).css('opacity', '100%')
        }
        if (this.person === sessionManager.get("username")){
            $('.progressText').text = sessionManager.get('username') + ", you have " + earnedBadges.length + " out of 4 badges right now."
            $('.progress-bar').css('width',  earnedBadges.length / 4 * 100 + "%");
            if ($(".bio").text() === ''){
                $(".bio").text('You do not have a bio yet, create one by pressing "edit profile"')
            }
        } else {
            $('#changeProfile').hide();
            $('#badgeOverview').hide();

        }

    }

    error() {
        $(".content").html("failed to load content")
    }
}