class PostRepository {
    constructor() {
        this.route = "/post"
    }

    async getPostInfo(postId) {
        return await networkManager
            .doRequest(`${this.route}/postinfo`, {id: postId}, "POST");
    }
}