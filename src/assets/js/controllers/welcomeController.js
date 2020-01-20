/**
 * Responsible for handling the actions happening on welcome view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class WelcomeController {
    //Reference to our loaded view

    constructor() {
        $.get("views/welcome.html")
            .done(this.setup.bind(this))
            .fail(this.error.bind(this));
    }

    //Called when the welcome.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        const welcomeView = $(data);

        //Set the name in the view from the session
        welcomeView.find(".name").html(appInstance().session.get("username"));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(welcomeView)

        //ajax request naar /kamers
        this.getExampleData("a02.11");
    }

    getExampleData(id) {
        appInstance().networkManager
            .doRequest("http://localhost:3000/example", {kamercode: id})
            .done((data) => {
                $(".content").html(JSON.stringify(data, null, 4));
            })
            .fail((reason) => {
                $(".content").html(reason);
            });
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}