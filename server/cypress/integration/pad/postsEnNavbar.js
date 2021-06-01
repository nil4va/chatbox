//Context: Login
describe('Login', function () {
  //Run before each test in this context
  beforeEach(() => {
    //Go to the specified URL
    cy.visit('http://localhost:8081/#posts')
    cy.server()
    cy.route({
      method: 'POST',
      url: '/posts',
      response: [
        { postId: 1, title: '3D Jewelry' },
        { postId: 2, title: 'Po Rack' },
        { postId: 3, title: 'Moove' },
        { postId: 4, title: 'Torii Stool' },
      ],
      status: 200,
    }).as('post')
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
    cy.route({
      method: 'POST',
      url: '/posts/1',
      response: {
        context:
          'Eve creates her pieces using a combination of digital manufacturing and hand skills, bringing 3d printed nylon and precious metals together in unique, captivating compositions',
        creator: 'EvgeniiaBalashova',
        title: '3D Jewelry',
      },
      status: 200,
    }).as('post')

    cy.get('#1').click()

    cy.wait('@post')

    cy.get('@post').should(xhr => {
      expect(xhr.response.body.title).equals('3D Jewelry')

      expect(xhr.response.body.creator).equals('EvgeniiaBalashova')
    })

    cy.get('#postTitle').should('contain', '3D Jewelry')
  })

  it('Open Post fail', function () {
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
