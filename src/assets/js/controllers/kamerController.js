/**
 * Responsible for handling the actions happening on welcome view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class KamerController {
    constructor() {
        $.get("views/kamer.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());

        this.kamerRepository = new KamerRepository();
    }

    //Called when the kamer.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.welcomeView = $(data);

        //Set the name in the view from the session
        this.welcomeView.find(".name").html(appInstance().sessionManager.get("username"));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.welcomeView)

        this.fetchKamers("a02.11");
    }

    /**
     * async function that retrieves a kamer by its id via repository
     * @param id
     * @returns {Promise<void>}
     */
    async fetchKamers(id) {
        try {
            //await keyword 'stops' code until data is returned - can only be used in async function
            const kamerData = await this.kamerRepository.get(id);

            this.welcomeView.append(JSON.stringify(kamerData, null, 4));
        } catch (e) {
            console.log(`error while fetching kamers ${e}`);

            //for now just show every error on page, normally not all errors are appropriate for user
            $(".content").append(e);
        }
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}