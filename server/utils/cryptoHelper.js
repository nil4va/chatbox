/**
 * Helper functions for generating cryptographic hashes
 *
 * @author Pim Meijer
 */
const crypto = require("crypto");
const bcrypt = require("bcrypt");

var saltRounds = 10;

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
function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

function validatePassword(input, hashedPw){
    return bcrypt.compare(input, hashedPw);
}

module.exports = {
    generateAuthToken,
    hashPassword,
    validatePassword,
};