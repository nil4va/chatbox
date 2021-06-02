//Context: Update profile
describe("updateProfile", function () {

    //setup page with standard sub and set session
    beforeEach(() => {
        cy.server();

        cy.route({
            method: "POST",
            url: "/profile/info",
            response: {firstName: "Xiaosu", lastName: "Yu", bio: "hi!"}
        }).as("profileInfo")

        cy.visit("http://localhost:8081/#updateProfile");

        //Login
        localStorage.setItem("session", JSON.stringify({"username": "XiaosuYu"}));
    });

    //Test: Validate update form
    it("Valid profile update form", () => {
        cy.get("#inputFirstname").should("exist");
        cy.get("#inputLastname").should("exist");
        cy.get("#inputBio").should("exist");
        cy.get("#saveProfile").should("exist");
    });

    //Test: old saved values are inserted
    it("old saved values are inserted", () => {
        cy.wait("@profileInfo")
        cy.get("#inputFirstname").should("have.value", "Xiaosu");
        cy.get("#inputLastname").should("have.value", "Yu");
        cy.get("#inputBio").should("have.value", "hi!");
    });

    //Test: Successful update first name
    it("Successful update first name", () => {
        cy.route("POST", "/profile/firstname")
            .as("firstNameUpdate");

        cy.get("#inputFirstname").type("new");

        cy.get("#saveProfile").click();

        cy.wait("@firstNameUpdate");

        cy.get("@firstNameUpdate").should((xhr) => {
            expect(xhr.request.body.firstName).equals("Xiaosunew");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update last name
    it("Successful update last name", () => {
        cy.get("#inputLastname").type("new");

        cy.route("POST", "/profile/lastname").as("lastNameUpdate");

        cy.get("#saveProfile").click();

        cy.wait("@lastNameUpdate");

        cy.get("@lastNameUpdate").should((xhr) => {
            expect(xhr.request.body.lastName).equals("Yunew");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update bio
    it("Successful update bio",  ()  => {
        cy.get("#inputBio").type("new");

        cy.route("POST", "/profile/bio").as("bioUpdate");

        cy.get("#saveProfile").click();

        cy.wait("@bioUpdate");

        cy.get("@bioUpdate").should((xhr) => {
            expect(xhr.request.body.bio).equals("hi!new");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.url().should("contain", "#profile");
    });

    //Test: Successful update everything
    it("Successful update everything",  () => {

        cy.get("#inputFirstname").type("new");
        cy.get("#inputLastname").type("new");
        cy.get("#inputBio").type("new");

        cy.route("POST", "/profile/firstname").as("firstNameUpdate");
        cy.route("POST", "/profile/lastname").as("lastNameUpdate");
        cy.route("POST", "/profile/bio").as("bioUpdate");

        cy.get("#saveProfile").click();

        cy.wait("@firstNameUpdate");
        cy.get("@firstNameUpdate").should((xhr) => {
            expect(xhr.request.body.firstName).equals("Xiaosunew");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.wait("@lastNameUpdate");
        cy.get("@lastNameUpdate").should((xhr) => {
            expect(xhr.request.body.lastName).equals("Yunew");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.wait("@bioUpdate");
        cy.get("@bioUpdate").should((xhr) => {
            expect(xhr.request.body.bio).equals("hi!new");
            expect(xhr.request.body.username).equals("XiaosuYu");
        });

        cy.url().should("contain", "#profile");
    });
});