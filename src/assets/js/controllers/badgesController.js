/**
 * badgesController shows all badges with info that are and can be achieved by the user
 * @author Nilava
 */

class BadgesController {
    constructor() {
        this.badgeRepository = new badgeRepository();

        $.get('views/badges.html')
            .done(htmlData => this.setup(htmlData))
            .fail(() => this.error())
    }

    async setup(htmlData) {
        this.badgesView = $(htmlData);
        $(".content").empty().append(this.badgesView);

        const earnedBadges = await this.badgeRepository.getBadgeInfo(sessionManager.get('username'))

        for (let i = 0; i < earnedBadges.length; i++) {
            const badgeNr = earnedBadges[i].badgeNr
            $('#badge' + badgeNr).hide()
            $('#badgeBorder' + badgeNr).css('opacity', '100%')
        }

        document.querySelector('.username').textContent = sessionManager.get('username') + ", you have " + earnedBadges.length + " out of 4 badges right now."

        const earnedPercentage = earnedBadges.length / 4 * 100 + "%"
        document.querySelector('.progress-bar').style.width =  earnedPercentage
        console.log(earnedBadges)
    }

    error() {
        $(".content").html("failed to load content")
    }
}