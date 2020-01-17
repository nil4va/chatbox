/**
 * Responsible for handling the actions happening on query view
 *
 * @author Lennard Fonteijn
 */
function queryController() {
    //Reference to our loaded view
    var queryView;

    function initialize() {
        $.get("views/query.html")
            .done(setup)
            .fail(error);
    }

    //Called when the login.html has been loaded
    function setup(data) {
        //Load the login-content into memory
        queryView = $(data);

        //Bind a click-event to the "Run query" button
        queryView.find("#query-submit").on("click", function() {
            handleQuery();
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(queryView);
    }

    function getKamers() {
        const databaseManager = new NetworkManager();

        databaseManager
            .query("S")
            .done(function (data) {
                $("#query-result").html(JSON.stringify(data, null, 4));
            })
            .fail(function (reason) {
                $("#query-result").html(reason);
            });
    }

    //Called when the login.html failed to load
    function error() {
        $(".content").html("Failed to load content!");
    }

    //Run the initialize function to kick things off
    initialize();
}