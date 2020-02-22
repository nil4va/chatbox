/**
 * @author Pim Meijer
 * @type {module:crypto}
 */
const crypto = require('crypto');

module.exports = {
    /**
     * Use this whenever you need a token. Eg. for a user when logged in
     * @returns {string} - randomized hex encoded string
     */
    generateAuthToken () {
        return crypto.randomBytes(30).toString('hex');
    },

    /**
     * Gives you a SHA256 hashes string back
     * @param password
     * @returns {string} hashed string in base64 format
     */
    getHashedPassword(password) {
        const sha256 = crypto.createHash('sha256');
        return sha256.update(password).digest('base64');
    }
};