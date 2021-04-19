class RegisterController {
    constructor() {
        this.registerRepository = new RegisterRepository();
        $.get("views/register.html")
            .done((data) => this.setup((data))
                .fail(() => this.error()));
    }

    setup(data) {
        this.createRegisterView = $(data);

        $(".content").empty().append(this.createRegisterView);

        this.createRegisterView.find("#toLogin").on("click", () => app.loadController(CONTROLLER_LOGIN));
        this.createRegisterView.find("#register").on("click", (e) => this.register(e))
    }

    error() {
        $(".content").html("Failed to load content!");
    }

    async register(event) {
        event.preventDefault();
        const username = this.createRegisterView.find("#name").val();
        const email = this.createRegisterView.find("#mail").val();
        const password = this.createRegisterView.find("#password").val();

        const nameCheck = await this.nameCheck();
        const mailCheck = await this.mailCheck();
        const passCheck = await this.passCheck();
        const repPassCheck = await this.repPassCheck();

        if (nameCheck && mailCheck && passCheck && repPassCheck){
            try {
               await this.registerRepository.create(username, email, password);
                sessionManager.set("username", username);
                app.loadController(CONTROLLER_SIDEBAR);
                app.loadController(CONTROLLER_POSTS);
            } catch (e) {
                console.log(e);
            }
        }
    }

    async nameCheck() {
        const username = this.createRegisterView.find("#name").val();

        if (username === "") {
            this.nameError("Please enter an username.");
            return false;
        }

        const nameInUse = await this.registerRepository.checkName(username);

        if (nameInUse){
            this.nameError("Name is already in use. Please choose another username.");
            return false;
        }

        this.createRegisterView.find("#name").removeClass('is-invalid');
        this.createRegisterView.find("#nameErrorMessage").empty();
        return true;
    }

    nameError(message) {
        this.createRegisterView.find("#name").addClass('is-invalid');
        this.createRegisterView.find("#nameErrorMessage").text(message);
    }

    async mailCheck() {
        const email = this.createRegisterView.find("#mail").val();

        if (email === ""){
            this.mailError("Please enter an email address.");
            return false;
        }

        const mailInUse = await this.registerRepository.checkMail(email);

        if (mailInUse) {
            this.mailError("An account with this email address already exists. Please log in.");
            return false;
        }

        var mailRegex = /^([_a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,3})$/;

        if (!mailRegex.test(email)) {
            this.mailError("Please enter a valid email address.");
            return false;
        }

        this.createRegisterView.find("#mail").removeClass('is-invalid');
        this.createRegisterView.find("#mailErrorMessage").empty();
        return true;
    }

    mailError(message) {
        this.createRegisterView.find("#mail").addClass('is-invalid');
        this.createRegisterView.find("#mailErrorMessage").text(message);
    }

    async passCheck() {
        const passwordField = this.createRegisterView.find("#password");
        const password = passwordField.val();
        

        passwordField.removeClass('is-invalid');
        this.createRegisterView.find("#pass1ErrorMessage").empty();
        return true;
    }

    async repPassCheck() {
        const repPasswordField = this.createRegisterView.find("#repPassword");
        const password = this.createRegisterView.find("#password").val();
        const repeatedPassword = repPasswordField.val();

        if (password !== repeatedPassword) {
            repPasswordField.addClass('is-invalid');
            this.createRegisterView.find("#pass2ErrorMessage").text("Passwords are not the same.");
            return false;
        }

        repPasswordField.removeClass('is-invalid');
        this.createRegisterView.find("#pass2ErrorMessage").empty();
        return true;
    }
}