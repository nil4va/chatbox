/**
 * Helper functions for generating cryptographic hashes
 *
 * @author Pim Meijer
 */
const crypto = require("crypto");

var saltLength = 9;

/**
 * Use this whenever you need a token. Eg. for a user when logged in
 *
 * @returns {string} - randomized hex encoded string
 */
function generateAuthToken () {
    return crypto.randomBytes(30).toString("hex");
}

/**
 * Gives you a SHA256 hashes string back
 *
 * @param password
 * @param salt
 * @returns {string} hashed string in base64 format
 */
function getHashedPassword(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const passwordHash = hash.digest('hex');
    return {
        salt,
        passwordHash
    };
}

function hashPassword(password) {
    const salt = makeSalt();
    return getHashedPassword(password, salt);
}

function makeSalt() {
    return crypto.randomBytes(Math.ceil(saltLength/2)).toString('hex').slice(0, saltLength);
}

function validatePassword(hashedPass, password, salt){
    return hashedPass === getHashedPassword(password, salt).passwordHash;
}

module.exports = {
    generateAuthToken,
    hashPassword,
    validatePassword
};