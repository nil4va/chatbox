/**
 * Responsible for handling the actions happening on navbarview
 *
 * @author Lennard Fonteijn, Pim Meijer, Maud de Jong
 */
class NavbarController {
    constructor() {
        $.get("views/navbar.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    setup(data) {
        const navbarView = $(data);

        //Find all anchors and register the click-event
        navbarView.find("a").on("click", this.handleClickMenuItem);

        //TODO: Add logic here to determine which menu items should be visible or not

        //Empty the sidebar-div and add the resulting view to the page
        $(".sidebar").empty().append(navbarView);
        app.isLoggedIn(
            () => this.hideWhenLoggedIn(),
            () => this.hideWhenLoggedOut()
        )
    }

    hideWhenLoggedIn(){
        $("#profile").text("Hello, "+ sessionManager.get('username'));
        $(".sidebar").find(".hideWhenLoggedIn").toggle(false);
        $(".sidebar").find(".hideWhenLoggedOut").toggle(true);
    }

    hideWhenLoggedOut(){
        $(".sidebar").find(".hideWhenLoggedOut").toggle(false);
        $(".sidebar").find(".hideWhenLoggedIn").toggle(true);
    }


    handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        const controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        app.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load the sidebar!");
    }
}
