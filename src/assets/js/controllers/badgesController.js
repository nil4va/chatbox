/**
 * badgesController shows all badges with info that are and can be achieved by the user
 * @author Nilava
 */

class BadgesController {
    constructor() {
        $.get('views/badges.html')
            .done(htmlData => this.setup(htmlData))
            .fail(() => this.error())
    }

    setup(htmlData) {
        this.badgesView = $(htmlData);

// toevoegen html aan .content div
        $(".content").empty().append(this.badgesView);
    }

    error() {
        $(".content").html("failed to load content")
    }
}