/**
 * Entry point front end application
 * @author Lennard Fonteijn en Pim Meijer
 */

/*
  * Global variable app to prevent creating multiple instances of App in all classes where it's used
  * A bit of a workaround for now
 */
let app;

class App {

    constructor() {
        this.session = sessionManager();
        this.databaseManager = databaseManager();

        //Constants (sort of)
        this.CONTROLLER_SIDEBAR = "sidebar";
        this.CONTROLLER_LOGIN = "login";
        this.CONTROLLER_LOGOUT = "logout";
        this.CONTROLLER_WELCOME = "welcome";
        this.CONTROLLER_PROFILE_OVERVIEW = "profile-overview";
        this.CONTROLLER_PROFILE_DETAIL = "profile-detail";
        this.CONTROLLER_QUERY = "query";

        //Always load the sidebar
        this.loadController(this.CONTROLLER_SIDEBAR);

        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        this.loadControllerFromUrl(this.CONTROLLER_WELCOME);

        //Setup the database manager
        this.databaseManager.connect("http://localhost:8080/");
        this.databaseManager.authenticate("yourtokenhere");
    }


    //This function is responsible for creating the controllers of all views
    loadController(name, controllerData) {
        console.log("loadController: " + name);

        if (controllerData) {
            console.log(controllerData);
        } else {
            controllerData = {};
        }

        switch (name) {
            case this.CONTROLLER_SIDEBAR:
                new SidebarController();
                break;

            case this.CONTROLLER_LOGIN:
                this.setCurrentController(name);
                this.isLoggedIn(() => new WelcomeController(), loginController);
                break;

            case this.CONTROLLER_LOGOUT:
                this.setCurrentController(name);
                this.handleLogout();
                break;

            case this.CONTROLLER_WELCOME:
                this.setCurrentController(name);
                this.isLoggedIn( () => new WelcomeController, loginController);
                break;

            case this.CONTROLLER_PROFILE_OVERVIEW:
                this.setCurrentController(name);
                this.isLoggedIn(profileOverviewController, loginController);
                break;

            case this.CONTROLLER_PROFILE_DETAIL:
                this.setCurrentController(name);
                this.isLoggedIn(
                    function () {
                        profileDetailController(controllerData)
                    },
                    loginController
                );
                break;

            case this.CONTROLLER_QUERY:
                this.setCurrentController(name);
                queryController();
                break;

            default:
                return false;
        }

        return true;
    }

    loadControllerFromUrl(fallbackController) {
        const currentController = this.getCurrentController();

        if (currentController) {
            if (!this.loadController(currentController)) {
                this.loadController(fallbackController);
            }
        } else {
            this.loadController(fallbackController);
        }
    }

    getCurrentController() {
        return location.hash.slice(1);
    }

    setCurrentController(name) {
        location.hash = name;
    }

    //Convenience functions to handle logged-in states
    isLoggedIn(whenYes, whenNo) {
        if (this.session.get("username")) {
            whenYes();
        } else {
            whenNo();
        }
    }

    handleLogout() {
        this.session.remove("username");

        loginController();
    }
}

//when DOM is ready, kick off our application
$(function () {
    app = new App();
});