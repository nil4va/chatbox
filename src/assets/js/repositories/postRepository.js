/**
 * This handles all database calls about posts.
 * @author Maud de Jong
 */
class PostRepository {
    constructor() {
        this.route = "/posts"
    }

    // gets the info of a certain post
     getPostInfo(postId) {
        return  networkManager
            .doRequest(`${this.route}/${postId}`, {}, "POST");
    }

    // gets all posts
    getAll() {
        return networkManager
            .doRequest(`${this.route}`, {}, "POST");
    }
}