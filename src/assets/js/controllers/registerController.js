/**
 * responsible for the register page
 *
 * @author Maud
 */
class RegisterController {
    constructor() {
        this.registerRepository = new RegisterRepository();

        $.get("views/register.html")
            .done((data) => this.setup(data))
                .fail(() => this.error());
    }

    setup(data) {
        this.createRegisterView = $(data);

        $(".content").empty().append(this.createRegisterView);

        this.createRegisterView.find("#toLogin").on("click", () => app.loadController(CONTROLLER_LOGIN));
        this.createRegisterView.find("#register").on("click", (e) => this.register(e))
    }

    // checks every value and if everything is right creates user
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

    // checks if the namefield is filled and the name is not already in use
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

    // add the error message fro the name to the right field
    nameError(message) {
        this.createRegisterView.find("#name").addClass('is-invalid');
        this.createRegisterView.find("#nameErrorMessage").text(message);
    }

    // checks if emailfield is filled, has the right form and is not already in use.
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

    // adds error message about mail to the right field
    mailError(message) {
        this.createRegisterView.find("#mail").addClass('is-invalid');
        this.createRegisterView.find("#mailErrorMessage").text(message);
    }

    // checks if password field is filled and has the right form
    async passCheck() {
        const passwordField = this.createRegisterView.find("#password");
        const password = passwordField.val();

        if (password.length < 6 ||
            !password.match(/[0-9]/) ||
            !password.match(/[a-z]/) ||
            !password.match(/[A-Z]/)
        ) {
            passwordField.addClass('is-invalid');
            this.createRegisterView.find("#pass1ErrorMessage").html("Password not valid. <br> " +
                "Please choose a password of at least 6 characters containing: <br>" +
                "- a number <br>- a lowercase letter <br>- an uppercase letter");
            return false;
        }

        passwordField.removeClass('is-invalid');
        this.createRegisterView.find("#pass1ErrorMessage").empty();
        return true;
    }

    // checks if second password field is filled and is the same as the first password
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

    error() {
        $(".content").html("Failed to load content!");
    }
}