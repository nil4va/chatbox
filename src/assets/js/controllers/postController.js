/**
 * responsible for showing all info about a post
 *
 * @author Maud
 */
class PostController {
  constructor(postId) {
    this.postRepository = new PostRepository()

    $.get('views/post.html')
      .done(data => this.setup(data, postId))
      .fail(() => this.error())
  }

  async setup(data, postId) {
    this.postView = $(data)

    const info = await this.postRepository.getPostInfo(postId)
    console.log(info)

    this.postView
      .find('#chatButton')
      .on('click', () => this.startChat(info.creator))

    // display text from database on screen
    this.postView.find('#postTitle').text(info.title)

    const photopath = 'assets/img/posts/' + postId + '.png'
    this.postView
      .find('#postPhoto')
      .html('<img src= ' + photopath + " alt = 'product photo'/>")

    this.postView.find('#postDescription').text(info.context)

    //Empty the content-div and add the resulting view to the page
    $('.content').empty().append(this.postView)
  }

  // go to chat with selected designer
  startChat(posterUserName) {

    if (sessionManager.get('username')) {
      app.loadController(CONTROLLER_CHAT, posterUserName)
      console.log('chat aangemaakt!')
    } else {
      alert('You have to be logged in in order to start a chat')
    }

  }

  error() {
    $(".content").html("Failed to load content!");
  }
}
