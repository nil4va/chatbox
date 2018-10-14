/**
 * Responsible for handling the actions happening on login view
 *
 * @author Lennard Fonteijn
 */
function loginController() {
    //Reference to our loaded view
    var loginView;

    function initialize() {
        $.get("views/login.html")
            .done(setup)
            .fail(error);
    }

    //Called when the login.html has been loaded
    function setup(data) {
        //Load the login-content into memory
        loginView = $(data);

        loginView.find(".login-form").on("submit", function() {
            handleLogin();

            //Return false to prevent the form submission from reloading the page.
            return false;
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(loginView);
    }

    function handleLogin() {
        //Find the username and password
        var username = loginView.find("[name='username']").val();
        var password = loginView.find("[name='password']").val();

        //Attempt to login
        if(username !== "test" || password !== "test") {
            loginView
                .find(".error")
                .html("Invalid credentials!");

            return;
        }

        //Set the username in the global session variable
        session.set("username", username);

        //Succesful login! Move to a welcome page or something.
        loadController(CONTROLLER_WELCOME);
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}