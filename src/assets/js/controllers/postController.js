/**
 * responsible for showing al info about a post
 *
 * @author Maud
 */

class PostController {
    constructor(postId) {
        this.postRepository = new PostRepository();

        $.get("views/post.html")
            .done((data) => this.setup(data, postId))
            .fail(() => this.error());
    }

    async setup(data, postId) {
        this.postView = $(data);

        const info = await this.postRepository.getPostInfo(postId);

        this.postView.find("#chatButton").on("click", e => this.startChat(info.username));

        // todo: use querystring


        // display text from database on screen
        this.postView.find("#postTitle").text(info.title);

        const photopath = "assets/img/posts/" + postId + ".png";
        this.postView.find("#postPhoto").html("<img src= " + photopath + " alt = 'product photo'/>");

        this.postView.find("#postDescription").text(info.context);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.postView);
    }

    startChat(posterUserName) {
        //check if user is logged in
        if (sessionManager.get("username")) {
            app.loadController(CONTROLLER_CHAT, (sessionManager.get("username"), posterUserName) );
            console.log("chat aangemaakt!")
            //TODO: kijk of er al een chat is, zo ja ga naar chatscherm. zo nee, start nieuwe chat
        } else {
            alert("You have to be logged in in order to start a chat");
        }
    }
}