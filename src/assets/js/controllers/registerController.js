class RegisterController {
    constructor() {
        this.registerRepository = new RegisterRepository();
        $.get("views/registreren.html")
            .done((data) => this.setup((data))
                .fail(() => this.error));
    }
    setup(data) {
        this.createRegisterView = $(data);

        this.createRegisterView.find(".name").html(sessionManager.get("username"));

        $(".content").empty().append(this.createRegisterView);

        this.createRegisterView.find(".btn").on("click", (event) => this.onAddEvent(event))
    }

    error() {
        $(".content").html("Failed to load content!");
    }

    async onAddEvent(event) {
        event.preventDefault();
        const username = this.createRegisterView.find("#exampleInputUsername").val();
        const password = this.createRegisterView.find("#exampleInputPassword").val();

        try{
            const registerId = await this.registerRepository.create(username,password);
            app.loadController(CONTROLLER_WELCOME);
        } catch (e) {
            console.log(e);
        }
    }
}