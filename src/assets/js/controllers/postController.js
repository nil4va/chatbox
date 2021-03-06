/**
 * responsible for showing al info about a post
 *
 * @author Maud
 */

class PostController {
    constructor() {
        this.postRepository = new postRepository();
        this.init();
    }

    setup(data) {
        this.postView = $(data);

        this.postView.find("#chatButtom").on("click", () => this.startChat);
    }

    startChat() {
        //check if user is logged in
        if (sessionManager.get("username")){
            //kijk of er al een chat is, zo ja ga naar chatscherm. zo nee, start nieuwe chat
        } else {
            alert("You have to be logged in in order to strart a chat");
        }
    }
}