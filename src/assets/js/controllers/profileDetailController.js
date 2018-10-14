/**
 * Responsible for handling the actions happening on profile detail view
 *
 * @author Lennard Fonteijn
 */
function profileDetailController(controllerData) {
    //Reference to our loaded view
    var profileDetailView;
    var profile;

    function initialize() {
        //Grab the profile from the passed controllerData
        profile = controllerData.profile;

        //If the profile is empty, move back to the overview.
        if(!profile) {
            loadController(CONTROLLER_PROFILE_OVERVIEW);

            return;
        }

        $.get("views/profile-detail.html")
            .done(setup)
            .fail(error);
    }

    //Called when the profile-detail.html has been loaded
    function setup(data) {
        //Load the profile detail content into memory
        profileDetailView = $(data);

        //Set the profile data in the view
        profileDetailView.find(".name").html(profile.name);
        profileDetailView.find(".avatar").css("background-image", "url('" + profile.avatar + "')");
        profileDetailView.find(".description").html(profile.description);

        //Add a click-event to the back-button
        profileDetailView.find(".back").on("click", function() {
            loadController(CONTROLLER_PROFILE_OVERVIEW);

            return false;
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(profileDetailView);
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}