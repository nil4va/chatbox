class PostRepository {
    constructor() {
        this.route = "/posts"
    }

     getPostInfo(postId) {
        return  networkManager
            .doRequest(`${this.route}/${postId}`, {}, "POST");
    }

    getAll() {
        return networkManager
            .doRequest(`${this.route}`, {}, "POST");
    }
}