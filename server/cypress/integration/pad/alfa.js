//Context: Login
describe('Login', function () {
  //Run before each test in this context
  beforeEach(() => {
    //Go to the specified URL
    cy.visit('http://localhost:3000/#posts')
  })

  before(() => {
    localStorage.setItem('session', '{"username":"test"}')
  })

  it('Navbar Elements LoggedIn', function () {
    expect(cy.get('[data-controller=chat]').should('be.visible'))
    expect(cy.get('[data-controller=posts]').should('be.visible'))
    expect(cy.get('[data-controller=logout]').should('be.visible'))
  })

  it('Navbar Elements LoggedOut', function () {
    expect(cy.get('[data-controller=register]').should('be.visible'))
    expect(cy.get('[data-controller=login]').should('be.visible'))
    expect(cy.get('[data-controller=posts]').should('be.visible'))
  })

  it('Open Post', function () {
    cy.server()

    cy.route('POST', '/posts/1').as('post')

    cy.get('#1').click()

    cy.wait('@post')

    cy.get('@post').should(xhr => {
      expect(xhr.response.body.title).equals('3D Jewelry')

      expect(xhr.response.body.creator).equals('EvgeniiaBalashova')
    })

    cy.get('#postTitle').should('contain', '3D Jewelry')
  })

  it('Open Post fail', function () {
    cy.server()

    cy.route({
      method: 'POST',
      url: '/posts/1',
      response: {},
      status: 200,
    }).as('post')

    cy.get('#1').click()

    cy.wait('@post')

    cy.get('#postTitle').should('contain', 'post is not correctly loaded')
  })
})
