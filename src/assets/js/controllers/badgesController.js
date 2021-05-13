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
            $('#badge' + (i + 1)).hide()
        }

        for (let i = 0; i < 4; i++) {
            if (typeof earnedBadges[i] === "undefined") {
                $('.badge' + (i + 1)).css("opacity", "50%")
            }
        }

        this.badgesView.find('.username').text(sessionManager.get('username') + ", you have " + earnedBadges.length + " out of 4 badges right now.")

        const earnedPercentage = earnedBadges.length / 4 * 100 + "%"
        this.badgesView.find('.progress-bar').css("width", earnedPercentage)
    }

    error() {
        $(".content").html("failed to load content")
    }
}