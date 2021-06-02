/**
 * Controller of the login page
 *
 * @author Maud de Jong
 */
class LoginController {

    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/login.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the login.html has been loaded
    setup(data) {
        this.loginView = $(data);

        this.loginView.find("#toReg").on("click", () => app.loadController(CONTROLLER_REGISTER));
        this.loginView.find(".login-form").on("submit", (e) => this.handleLogin(e));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.loginView);
    }

    /**
     * Async function that does a login request via repository
     * @param event
     */
    async handleLogin(event) {
        event.preventDefault();

        const username = document.querySelector("#exampleInputUsername").value;
        const password = document.querySelector("#exampleInputPassword").value;

        try{
            const user = await this.userRepository.login(username, password);

            sessionManager.set("username", user.username);
            app.loadController(CONTROLLER_SIDEBAR);
            app.loadController(CONTROLLER_POSTS);

        } catch(e) {
            //if unauthorized error show error to user
            if(e.code === 401) {
                this.loginView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}