//Global variables
const session = sessionManager();
var databaseManager = databaseManager();

//Constants (sort of)
const CONTROLLER_SIDEBAR = "sidebar";
const CONTROLLER_LOGIN = "login";
const CONTROLLER_LOGOUT = "logout";
const CONTROLLER_WELCOME = "welcome";
const CONTROLLER_PROFILE_OVERVIEW = "profile-overview";
const CONTROLLER_PROFILE_DETAIL = "profile-detail";
const CONTROLLER_QUERY = "query";

//This is called when the browser is done loading
$(function() {
    //Always load the sidebar
    loadController(CONTROLLER_SIDEBAR);

    //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
    loadControllerFromUrl(CONTROLLER_WELCOME);

    //Setup the database manager
    databaseManager.connect("http://localhost:8080/");
    databaseManager.authenticate("yourtokenhere");
});

//This function is responsible for creating the controllers of all views
function loadController(name, controllerData) {
    console.log("loadController: " + name);

    if(controllerData) {
        console.log(controllerData);
    }
    else {
        controllerData = {};
    }

    switch(name) {
        case CONTROLLER_SIDEBAR:
            new SidebarController();
            break;

        case CONTROLLER_LOGIN:
            setCurrentController(name);
            isLoggedIn(welcomeController, loginController);
            break;

        case CONTROLLER_LOGOUT:
            setCurrentController(name);
            handleLogout();
            break;

        case CONTROLLER_WELCOME:
            setCurrentController(name);
            isLoggedIn(welcomeController, loginController);
            break;

        case CONTROLLER_PROFILE_OVERVIEW:
            setCurrentController(name);
            isLoggedIn(profileOverviewController, loginController);
            break;

        case CONTROLLER_PROFILE_DETAIL:
            setCurrentController(name);
            isLoggedIn(
                function() {
                    profileDetailController(controllerData)
                },
                loginController
            );
            break;

        case CONTROLLER_QUERY:
            setCurrentController(name);
            queryController();
            break;

        default:
            return false;
    }

    return true;
}

function loadControllerFromUrl(fallbackController) {
    var currentController = getCurrentController();

    if(currentController) {
        if(!loadController(currentController)) {
            loadController(fallbackController);
        }
    }
    else {
        loadController(fallbackController);
    }
}

function getCurrentController() {
    return location.hash.slice(1);
}

function setCurrentController(name) {
    location.hash = name;
}

//Convenience functions to handle logged-in states
function isLoggedIn(whenYes, whenNo) {
    if(session.get("username")) {
        whenYes();
    }
    else {
        whenNo();
    }
}

function handleLogout() {
    session.remove("username");

    loginController();
}