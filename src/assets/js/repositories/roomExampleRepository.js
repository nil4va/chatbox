/**
 * -- THIS IS AN EXAMPLE REPOSITORY WITH EXAMPLE DATA FROM DB --
 * Repository responsible for all room related data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with `networkManager`!
 *
 * @author Pim Meijer
 */
class RoomExampleRepository {

    constructor() {
        this.route = "/room_example"
    }

    async getAll() {

    }

    /**
     * async function to get a piece of room example data by its id via networkmanager
     * [id: roomId] - "id" is also called id in database! Make sure this is always the same
     * @param roomId
     * @returns {Promise<room>}
     */
    async get(roomId) {
        return await networkManager
            .doRequest(this.route,{id: roomId});
    }

    async create() {

    }

    async delete() {

    }

    async update(id, values = {}) {

    }
}