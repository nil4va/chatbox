class RegisterController {
    constructor() {
        this.userRepository = new UserRepository();
        $.get("views/registreren.html")
            .done((data) => this.setup((data))
                .fail(() => this.error));
    }
    setup(data) {
        this.welcomeView = $(data);

        this.welcomeView.find(".name").html(sessionManager.get("username"));

        $(".content").empty().append(this.welcomeView);

        this.fetchRooms(1256);
    }

    async fetchRooms(roomId) {
        const exampleResponse = this.welcomeView.find(".example-response");
        try {

            const roomData = await this.roomExampleRepository.get(roomId);

            exampleResponse.text(JSON.stringify(roomData, null, 4));
        } catch (e) {
            console.log("error while fetching rooms", e);

            exampleResponse.text(e);
        }
    }

    error() {
        $(".content").html("Failed to load content!");
    }
}