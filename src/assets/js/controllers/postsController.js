/**
 * responsible for showing all posts in db
 *
 * @author maud
 */
class PostsController {
    constructor() {
        this.postsRepository = new PostsRepository();

        $.get("views/posts.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    async setup(data) {
        this.postsView = $(data);

        // todo: use querystring
        const info = await this.postsRepository.getPosts();

        // display each post from database on screen with title and photo
        info.forEach(post => {
            const image = "<img src= 'src/assets/img/posts/" + post.postId + ".png' alt = 'product photo' class='postimg'/>"
            this.postsView.find("#content").append(
                "<div id=" + post.postId + " class='post '>" + image + post.title + "</div>");
        })

        this.postsView.find(".post").addClass("col").on("click", this.goToPost);
        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.postsView);
    }

    goToPost() {
        const postId = this.id;
        app.loadController(CONTROLLER_POST, postId);
        console.log(postId);
    }
}