class RegisterController {
    constructor() {
        this.registerRepository = new RegisterRepository();
        $.get("views/register.html")
            .done((data) => this.setup((data))
                .fail(() => this.error));
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
               app.loadController(CONTROLLER_WELCOME);
            } catch (e) {
                console.log(e);
            }
        }
    }

    async nameCheck() {
        const nameField = this.createRegisterView.find("#name");
        const username = nameField.val();

        if (username === "") {
            nameField.addClass('is-invalid');
            return false;
        }

        const nameInUse = await this.registerRepository.checkName(username);

        if (nameInUse){
            nameField.addClass('is-invalid');
            return false;
        }
        nameField.removeClass('is-invalid');
        return true;
    }

    async mailCheck() {
        const emailField = this.createRegisterView.find("#mail");
        const email = emailField.val();

        if (email === ""){
            emailField.addClass('is-invalid');
            return false;
        }

        const mailInUse = await this.registerRepository.checkMail(email);

        var mailRegex = /^([_a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,3})$/;

        if (mailInUse || !mailRegex.test(email)) {
            emailField.addClass('is-invalid');
            return false;
        }
        emailField.removeClass('is-invalid');
        return true;
    }

    async passCheck() {
        const passwordField = this.createRegisterView.find("#password");
        const password = passwordField.val();

        if (password.length < 6 ||
            !password.match(/[0-9]/) ||
            !password.match(/[a-z]/) ||
            !password.match(/[A-Z]/) ||
            password.match(/["{}|<>]/)
        ) {
            passwordField.addClass('is-invalid');
            return false;
        }

        passwordField.removeClass('is-invalid');
        return true;
    }

    async repPassCheck() {
        const repPasswordField = this.createRegisterView.find("#repPassword");
        const password = this.createRegisterView.find("#password").val();
        const repeatedPassword = repPasswordField.val();

        if (password !== repeatedPassword) {
            repPasswordField.addClass('is-invalid');
            return false;
        }

        repPasswordField.removeClass('is-invalid');
        return true;
    }
}