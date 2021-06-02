/**
 * Helper function that salts a password or checks if the salted pw is the same as unsalted version
 *
 * @author Maud de Jong
 */
const bcrypt = require("bcrypt");

var saltRounds = 10;

/**
 * Gives you a SHA256 hashes string back
 *
 * @param password the unsalted password
 * @returns {string} salted password
 */
function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

/**
 *
 * @param input the unsalted string you want to compare
 * @param hashedPw the salted password you want to compare the string with
 * @returns {void|Promise<never>|Promise<unknown>|*}
 */
function validatePassword(input, hashedPw){
    return bcrypt.compare(input, hashedPw);
}

module.exports = {
    hashPassword,
    validatePassword,
};