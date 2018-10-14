/**
 * Responsible for handling the actions happening on welcome view
 *
 * @author Lennard Fonteijn
 */
function welcomeController() {
    //Reference to our loaded view
    var welcomeView;

    function initialize() {
        $.get("views/welcome.html")
            .done(setup)
            .fail(error);
    }

    //Called when the welcome.html has been loaded
    function setup(data) {
        //Load the welcome-content into memory
        welcomeView = $(data);

        //Set the name in the view from the session
        welcomeView.find(".name").html(session.get("username"));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(welcomeView);
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}