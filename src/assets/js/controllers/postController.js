/**
 * responsible for showing al info about a post
 *
 * @author Maud
 */

class PostController {
    constructor() {

        this.postRepository = new PostRepository();

        $.get("views/post.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    async setup(data) {
        this.postView = $(data);

        this.postView.find("#chatButton").on("click", this.startChat);

        const info = await this.postRepository.getPostInfo(1);

        // display text from database on screen
        this.postView.find("#postTitle").text(info.title);
        //TODO: photos in and out of database
        this.postView.find("#postPhoto").text(info.photo);
        this.postView.find("#postDescription").text(info.context);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.postView);
    }

    startChat() {
        //check if user is logged in
        if (sessionManager.get("username")){
            console.log("chat aangemaakt!")
            //TODO: kijk of er al een chat is, zo ja ga naar chatscherm. zo nee, start nieuwe chat
        } else {
            alert("You have to be logged in in order to start a chat");
        }
    }
}