/**
 * Entry point front end application
 * Singleton for App instance
 * @author Lennard Fonteijn en Pim Meijer
 */

const appInstance = () => {
    class App {

        constructor() {
            this.sessionManager = new SessionManager();
            this.networkManager = new NetworkManager();

            //Constants (sort of)
            this.CONTROLLER_SIDEBAR = "sidebar";
            this.CONTROLLER_LOGIN = "login";
            this.CONTROLLER_LOGOUT = "logout";
            this.CONTROLLER_KAMER = "kamer";

            //Always load the sidebar
            this.loadController(this.CONTROLLER_SIDEBAR);

            //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
            this.loadControllerFromUrl(this.CONTROLLER_KAMER);

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
                    this.isLoggedIn(() => new KamerController(), () => new LoginController());
                    break;

                case this.CONTROLLER_LOGOUT:
                    this.setCurrentController(name);
                    this.handleLogout();
                    break;

                case this.CONTROLLER_KAMER:
                    this.setCurrentController(name);
                    this.isLoggedIn(() => new KamerController, () => new LoginController());
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
            console.log(this.sessionManager);
            if (this.sessionManager.get("username")) {
                whenYes();
            } else {
                whenNo();
            }
        }

        handleLogout() {
            this.sessionManager.remove("username");

            //go to login screen
            this.loadController(this.CONTROLLER_LOGIN);
        }
    }
    
    //if it doesnt exist, create it, otherwise return it(singleton)
    if (!this.app) {
        this.app = new App();
    }

    return this.app;

};
//when DOM is ready, kick off our application
$(function () {
    appInstance();
});