/**
 * Responsible for handling the actions happening on profile overview view
 *
 * @author Lennard Fonteijn
 */
function profileOverviewController() {
    //Reference to our loaded view
    var profileOverviewView;
    var profileTileTemplate;

    function initialize() {
        var profileOverviewRequest = $.get("views/profile-overview.html");
        var profileTileRequest = $.get("views/templates/profile-tile.html");

        //Wait for all data to arrive
        $.when(profileOverviewRequest, profileTileRequest)
            .done(function(profileOverviewResponse, profileTileResponse) {
                //Index 0 of a response is the actual data
                setup(profileOverviewResponse[0], profileTileResponse[0]);
            })
            .fail(error);
    }

    //Called when the welcome.html has been loaded
    function setup(profileOverviewResponse, profileTileResponse) {
        //Load the content into memory
        profileOverviewView = $(profileOverviewResponse);
        profileTileTemplate = $(profileTileResponse);

        //Now load the actual data we want to display
        loadProfiles();
    }

    function loadProfiles() {
        $.get("data/profiles.json")
            .done(displayProfiles)
            .fail(error);
    }

    function displayProfiles(data) {
        //Loop through the data
        for(var i = 0; i < data.profiles.length; i++) {
            var profile = data.profiles[i];

            //Make a copy of the profile tile template
            var profileTile = profileTileTemplate.clone();

            //Add the data to the profile tile
            profileTile.find(".avatar").css("background-image", "url('" + profile.avatar + "')");
            profileTile.find(".name").html(profile.name);
            profileTile.find(".description").html(profile.description);

            //Store the profile-data under this profile tile so we can access it later
            profileTile.data("profile", profile);

            //Add a click-event and retrieve the profile-data
            profileTile.on("click", function() {
                var profile = $(this).data("profile");

                loadController(CONTROLLER_PROFILE_DETAIL, {
                    profile: profile
                });
            });

            //Add the profile tile to the view
            profileOverviewView.find(".profiles").append(profileTile);
        }

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(profileOverviewView);
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}