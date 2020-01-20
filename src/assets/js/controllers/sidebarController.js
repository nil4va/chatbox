
/**
 * Responsible for handling the actions happening on sidebar view
 *
 * @author Lennard Fonteijn, Pim Meijer
 */
class SidebarController {
    constructor() {
        $.get("views/sidebar.html")
            .done(this.setup.bind(this))
            .fail(this.error.bind(this));
    }

    //Called when the sidebar.html has been loaded
    setup(data) {
        //Load the sidebar-content into memory
        const sidebarView = $(data);

        //Find all anchors and register the click-event
        sidebarView.find("a").on("click", this.handleClickMenuItem);

        //TODO: Add logic here to determine which menu items should be visible or not

        //Empty the sidebar-div and add the resulting view to the page
        $(".sidebar").empty().append(sidebarView);
    }

    handleClickMenuItem() {

        //Get the data-controller from the clicked element (this)
        const controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        appInstance().loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load the sidebar!");
    }
}
