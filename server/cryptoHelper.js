const crypto = require('crypto');

module.exports = {
    generateAuthToken () {
        return crypto.randomBytes(30).toString('hex');
    },

    getHashedPassword(password) {
        const sha256 = crypto.createHash('sha256');
        return sha256.update(password).digest('base64');
    }
};