/**
 * Repository responsible for all kamer related data from server
 * Make sure all functions are using the async keyword when interacting with network!
 * @author Pim Meijer
 */

class KamerRepository {
    constructor() {
        //TODO: get url from config
        this.route = "/kamer"
    }

    async getAll() {

    }

    /**
     * async function to get a kamer by its kamercode via networkmanager
     * @param id
     * @returns {Promise<kamer>}
     */
    async get(id) {
        return await appInstance().networkManager
            .doRequest(this.route, {kamercode: id});
    }

    async delete() {

    }

    async update(id, values = {}) {

    }
}