//Context: Update profile
describe("updateProfile", function () {
    //Run before each test in this context

    beforeEach(() => {
        cy.server();

        cy.route({
            method: "POST",
            url: "/profile/info",
            response: {firstName: "Xiaosu", lastName: "", bio: ""}
        }).as("profileInfo")

        cy.visit("http://localhost:8081/#updateProfile");

        //Login
        localStorage.setItem("session", JSON.stringify({"username": "test"}));
    });

    //Test: Validate login form
    it("Valid profile update form", () => {
        cy.get("#inputFirstname").should("exist");
        cy.get("#inputLastname").should("exist");
        cy.get("#inputBio").should("exist");
        cy.get("#saveProfile").should("exist");
    });

    //Test: test values are inserted
    it("test values are inserted", () => {
        cy.wait("@profileInfo")
        cy.get("#inputFirstname").should("have.value", "Xiaosu");
    });

    //Test: Successful update first name
    it("Successful update first name", () => {
        cy.route("POST", "/profile/firstname", {firstName: "testName", username: "test"})
            .as("firstNameUpdate");

        cy.get("#inputFirstname").type("new");
        cy.get("#saveProfile").click();

        cy.wait("@firstNameUpdate");

        cy.get("@firstNameUpdate").should((xhr) => {
            expect(xhr.request.body.firstName).equals("Xiaosunew");
            expect(xhr.request.body.username).equals("test");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update last name
    it("Successful update last name", () => {
        cy.server();
        cy.get("#inputLastname").type("testLastName");
        cy.route("POST", "/profile/lastname", {lastName: "testLastName", username: "test"}).as("lastNameUpdate");

        cy.get("#saveProfile").click();

        cy.wait("@lastNameUpdate");

        cy.get("@lastNameUpdate").should((xhr) => {
            expect(xhr.request.body.lastName).equals("testLastName");
            expect(xhr.request.body.username).equals("test");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update bio
    it("Successful update bio",  ()  => {
        cy.server();

        cy.get("#inputBio").type("test test bio");

        cy.route("POST", "/profile/bio", {bio: "test test bio", username: "test"}).as("bioUpdate");

        cy.get("#saveProfile").click();

        cy.wait("@bioUpdate");

        cy.get("@bioUpdate").should((xhr) => {
            expect(xhr.request.body.bio).equals("test test bio");
            expect(xhr.request.body.username).equals("test");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update everything
    it("Successful update everything",  () => {
        cy.server();
        cy.get("#inputFirstname").type("New");
        cy.get("#inputLastname").type("testLastName");
        cy.get("#inputBio").type("test test bio");

        cy.route("POST", "/profile/firstname", {firstName: "XiaosuNew", username: "test"}).as("firstNameUpdate");
        cy.route("POST", "/profile/lastname", {lastName: "testLastName", username: "test"}).as("lastNameUpdate");
        cy.route("POST", "/profile/bio", {bio: "test test bio", username: "test"}).as("bioUpdate");

        //Find the button to login and click it.
        cy.get("#saveProfile").click();

        cy.wait("@firstNameUpdate");
        cy.get("@firstNameUpdate").should((xhr) => {
            expect(xhr.request.body.firstName).equals("XiaosuNew");
            expect(xhr.request.body.username).equals("test");
        });

        cy.wait("@lastNameUpdate");
        cy.get("@lastNameUpdate").should((xhr) => {
            expect(xhr.request.body.lastName).equals("testLastName");
            expect(xhr.request.body.username).equals("test");
        });

        cy.wait("@bioUpdate");
        cy.get("@bioUpdate").should((xhr) => {
            expect(xhr.request.body.bio).equals("test test bio");
            expect(xhr.request.body.username).equals("test");
        });

        cy.url().should("contain", "#profile");
    });



});