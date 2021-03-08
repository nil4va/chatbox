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

        this.postView.find("#chatButton").on("click", this.startChat);

        // todo: use querystring
        const info = await this.postRepository.getPostInfo(postId);

        // display text from database on screen
        this.postView.find("#postTitle").text(info.title);

        const photopath = "src/assets/img/posts/" + postId + ".png";
        this.postView.find("#postPhoto").html("<img src= " + photopath + " alt = 'product photo'/>");

        this.postView.find("#postDescription").text(info.context);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.postView);
    }

    startChat() {
        //check if user is logged in
        if (sessionManager.get("username")) {
            console.log("chat aangemaakt!")
            //TODO: kijk of er al een chat is, zo ja ga naar chatscherm. zo nee, start nieuwe chat
        } else {
            alert("You have to be logged in in order to start a chat");
        }
    }
}