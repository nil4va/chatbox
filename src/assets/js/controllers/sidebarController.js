/**
 * Responsible for handling the actions happening on sidebar view
 *
 * @author Lennard Fonteijn
 */
function sidebarController() {
    //Reference to our loaded view
    var sidebarView;

    function initialize() {
        $.get("views/sidebar.html")
            .done(setup)
            .fail(error);
    }

    //Called when the sidebar.html has been loaded
    function setup(data) {
        //Load the sidebar-content into memory
        sidebarView = $(data);

        //Find all anchors and register the click-event
        sidebarView.find("a").on("click", handleClickMenuItem);

        //TODO: Add logic here to determine which menu items should be visible or not

        //Empty the sidebar-div and add the resulting view to the page
        $(".sidebar").empty().append(sidebarView);
    }
    function handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        var controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load the sidebar!");
    }

    //Run the initialize function to kick things off
    initialize();
}