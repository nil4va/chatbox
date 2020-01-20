/**
 * Responsible for handling the actions happening on login view
 *
 * @author Lennard Fonteijn
 */
class LoginController {
    //Reference to our loaded view

    constructor() {
        $.get("views/login.html")
            .done(this.setup.bind(this))
            .fail(this.error.bind(this));
    }

    //Called when the login.html has been loaded
    setup(data) {
        //Load the login-content into memory
        this.loginView = $(data);

        this.loginView.find(".login-form").on("submit", (e) => this.handleLogin(e));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.loginView);
    }

    handleLogin(event) {
        //prevent actual submit
        event.preventDefault();

        //Find the username and password
        const username = this.loginView.find("[name='username']").val();
        const password = this.loginView.find("[name='password']").val();

        appInstance().networkManager
            .doRequest("http://localhost:3000/login", {"username": username, "password": password})
            .done((data) => {
                //Succesful login! Move to a welcome page or something.
                console.log("success: " + data);
                app.session.set("username", username);
                app.loadController(app.CONTROLLER_WELCOME);
            })
            .fail((reason) => {
                console.log("fail: ");
                this.loginView
                    .find(".error")
                    .html(reason.responseText);
            });

    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}