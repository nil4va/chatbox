//Context: Register
describe("Register", function () {
    beforeEach(() => {
        cy.server();

        cy.visit("http://localhost:8081/#register");
    });

    //Test: Validate login form
    it("Valid register form", function () {
        //Find the field for the username, check if it exists.
        cy.get("#name").should("exist");

        //Find the field for the email-adress, check if it exists.
        cy.get("#mail").should("exist");

        //Find the field for password, check if it exists.
        cy.get("#password").should("exist");

        //Find the field for repeat password, check if it exists.
        cy.get("#repPassword").should("exist");

        //Find the button for register, check if it exists.
        cy.get("#register").should("exist");
    });

    //Test: Successful register
    it("Successful register", function () {

        cy.route("POST", "/register/name", false).as("registerName");
        cy.route("POST", "/register/mail", false).as("registerMail");
        cy.route("POST", "/register/add", {"id": 1}).as("registerAdd");

        cy.get("#name").type("Nilava");

        cy.get("#mail").type("nilava@live.com");

        cy.get("#password").type("Pasta20");

        cy.get("#repPassword").type("Pasta20");

        //Find the button to login and click it.
        cy.get("#register").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@registerName");
        cy.wait("@registerMail");
        cy.wait("@registerAdd");

        // The @login-stub is called, check the contents of the incoming request.
        cy.get("@registerName").should((xhr) => {

            //The username should match what we typed earlier
            expect(xhr.request.body.username).equals("Nilava");
        });

        cy.get("@registerMail").should((xhr) => {

            //The username should match what we typed earlier
            expect(xhr.request.body.email).equals("nilava@live.com");
        });

        cy.get("@registerAdd").should((xhr) => {

            //The username should match what we typed earlier
            expect(xhr.request.body.username).equals("Nilava");
            expect(xhr.request.body.email).equals("nilava@live.com");
            expect(xhr.request.body.password).equals("Pasta20");
        });

        //After a successful register, the URL should now contain #welcome.
        cy.url().should("contain", "#posts");
    });

    // failed register - name in use
    it("Failed register", function () {

        cy.route("POST", "/register/name", {"username": "Nilava"}).as("registerName");

        cy.get("#name").type("Nilava");

        cy.get("#mail").type("nilava@live.com");

        cy.get("#password").type("Pasta20");

        cy.get("#repPassword").type("Pasta20");

        //Find the button to login and click it.
        cy.get("#register").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@registerName");

        // The @login-stub is called, check the contents of the incoming request.
        cy.get("@registerName").should((xhr) => {

            //The username should match what we typed earlier
            expect(xhr.request.body.username).equals("Nilava");
        });

        cy.get("#nameErrorMessage").should("exist").should("contain", "Name is already in use. Please choose another username.");
    });
})