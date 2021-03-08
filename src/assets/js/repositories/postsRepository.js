class PostsRepository {
    constructor() {
        this.route = "/posts"
    }

    async getPosts() {
        return await networkManager
            .doRequest(`${this.route}/posts`, {}, "POST");
    }
}