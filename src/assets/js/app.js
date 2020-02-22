/**
 * Entry point front end application - there is also an app.js for the backend(server folder)!
 * Singleton for App instance - via this instance you can get the sessionManager, network manager or change controller
 * Use: appInstance().sessionManager or appInstance().networkManager or appInstance().sessionManager or  appInstance().loadController(..)
 * You only want one instance of this class and the used classes within - always use appInstance().
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
            this.CONTROLLER_WELCOME = "welcome";

            //Always load the sidebar
            this.loadController(this.CONTROLLER_SIDEBAR);

            //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
            this.loadControllerFromUrl(this.CONTROLLER_WELCOME);

        }


        /**
         * Loads a controller
         * @param name - name of controller - see constants
         * @param controllerData - data to pass from on controller to another
         * @returns {boolean} - successful controller change
         */
        loadController(name, controllerData) {
            console.log("loadController: " + name);

            if (controllerData) {
                console.log(controllerData);
            } else {
                controllerData = {};
            }

            switch (name) {
                case this.CONTROLLER_SIDEBAR:
                    new NavbarController();
                    break;

                case this.CONTROLLER_LOGIN:
                    this.setCurrentController(name);
                    this.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                    break;

                case this.CONTROLLER_LOGOUT:
                    this.setCurrentController(name);
                    this.handleLogout();
                    break;

                case this.CONTROLLER_WELCOME:
                    this.setCurrentController(name);
                    this.isLoggedIn(() => new WelcomeController, () => new LoginController());
                    break;


                default:
                    return false;
            }

            return true;
        }

        /**
         * Alternative way of loading controller by url
         * @param fallbackController
         */
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

        /**
         * Convenience functions to handle logged-in states
         * @param whenYes - function to execute when user is logged in
         * @param whenNo - function to execute when user is logged in
         */
        isLoggedIn(whenYes, whenNo) {
            if (this.sessionManager.get("username")) {
                whenYes();
            } else {
                whenNo();
            }
        }

        /**
         * Removes username via sessionManager and loads the login screen
         */
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