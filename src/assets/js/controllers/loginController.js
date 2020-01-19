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

        loginView.find(".login-form").on("submit", function(e) {
            e.preventDefault();
            handleLogin();

            //Return false to prevent the form submission from reloading the page.
            return false;
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(loginView);
    }

    function handleLogin() {
        //Find the username and password
        const username = loginView.find("[name='username']").val();
        const password = loginView.find("[name='password']").val();
        console.log("geweldig");

        app.networkManager
            .doRequest("http://localhost:3000/login", { "username": username, "password": password})
            .done((data) => {
                console.log("success: "+ data);
                app.session.set("username", username);
                app.loadController(app.CONTROLLER_WELCOME);
            })
            .fail((reason) => {
                console.log("fail");
                    loginView
                        .find(".error")
                        .html(reason);
            });

        //Succesful login! Move to a welcome page or something.
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}