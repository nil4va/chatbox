/**
 * Responsible for handling the actions happening on welcome view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class WelcomeController {
    //Reference to our loaded view

    constructor() {
        $.get("views/welcome.html")
            .done(this.setup.bind(this))
            .fail(this.error.bind(this));
    }

    //Called when the welcome.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        const welcomeView = $(data);

        //Set the name in the view from the session
        welcomeView.find(".name").html(app.session.get("username"));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(welcomeView);
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}