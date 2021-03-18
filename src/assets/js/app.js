/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * Available: `sessionManager` or `networkManager` or `app.loadController(..)`
 *
 * You only want one instance of this class, therefor always use `app`.
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
const CONTROLLER_SIDEBAR = 'sidebar'
const CONTROLLER_LOGIN = 'login'
const CONTROLLER_LOGOUT = 'logout'
const CONTROLLER_WELCOME = 'welcome'
const CONTROLLER_UPLOAD = 'upload'
const CONTROLLER_CHAT = 'chat'
const CONTROLLER_POST = 'post'
const CONTROLLER_POSTS = 'posts'
const CONTROLLER_REGISTREREN = 'register'

const sessionManager = new SessionManager()
const networkManager = new NetworkManager()

HTMLElement.prototype.$ = function (q) {
  return this.querySelector(q)
}

HTMLElement.prototype.$$ = function (q) {
  return Array.from(this.querySelectorAll(q))
}

HTMLElement.prototype.on = function (evt, func) {
  this.addEventListener(evt, func)
}

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}

String.prototype.random = function () {
  return Array.from(this).random()
}

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  )
}

class App {
  init() {
    if (!sessionManager.get('pinList')) sessionManager.set('pinList', [])

    //Always load the sidebar
    this.loadController(CONTROLLER_SIDEBAR)

    //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
    this.loadControllerFromUrl(CONTROLLER_WELCOME)
  }

  /**
   * Loads a controller
   * @param name - name of controller - see constants
   * @param controllerData - data to pass from on controller to another
   * @returns {boolean} - successful controller change
   */
  loadController(name, controllerData) {
    switch (name) {
      case CONTROLLER_SIDEBAR:
        new NavbarController()
        break

      case CONTROLLER_LOGIN:
        this.setCurrentController(name)
        this.isLoggedIn(
          () => new WelcomeController(),
          () => new LoginController()
        )
        break

      case CONTROLLER_LOGOUT:
        this.setCurrentController(name)
        this.handleLogout()
        break

      case CONTROLLER_WELCOME:
        this.setCurrentController(name)
        this.isLoggedIn(
          () => new WelcomeController(),
          () => new LoginController()
        )
        break

      case CONTROLLER_UPLOAD:
        new UploadController()
        break

      case CONTROLLER_CHAT:
        this.setCurrentController(name)
        this.isLoggedIn(
          () => new ChatController(controllerData),
          () => new LoginController()
        )
        break

      case CONTROLLER_POSTS:
        this.setCurrentController(name)
        new PostsController()
        break

      case CONTROLLER_POST:
        this.setCurrentController(name)
        new PostController(controllerData)
        break

      case CONTROLLER_REGISTREREN:
        this.setCurrentController(name)
        this.isRegisterd(
          () => new WelcomeController(),
          () => new RegisterController()
        )
        break

      default:
        return false
    }

    return true
  }

  /**
   * Alternative way of loading controller by url
   * @param fallbackController
   */
  loadControllerFromUrl(fallbackController) {
    const currentController = this.getCurrentController()

    if (currentController) {
      if (!this.loadController(currentController)) {
        this.loadController(fallbackController)
      }
    } else {
      this.loadController(fallbackController)
    }
  }

  getCurrentController() {
    return location.hash.slice(1)
  }

  setCurrentController(name) {
    location.hash = name
  }

  /**
   * Convenience functions to handle logged-in states
   * @param whenYes - function to execute when user is logged in
   * @param whenNo - function to execute when user is logged in
   */
  isLoggedIn(whenYes, whenNo) {
    if (sessionManager.get('username')) {
      whenYes()
    } else {
      whenNo()
    }
  }

  isRegisterd(whenYes, whenNo) {
    if (sessionManager.get('username')) {
      whenYes()
    } else {
      whenNo
    }
  }

  /**
   * Removes username via sessionManager and loads the login screen
   */
  handleLogout() {
    sessionManager.remove('username')

    //go to login screen
    this.loadController(CONTROLLER_LOGIN)
  }
}

const app = new App()

//When the DOM is ready, kick off our application.
$(function () {
  app.init()
})
