/**
 * @author Pim Meijer & Lennard Fonteijn
 * Database connection pool with MySQL
 * This class uses config from config/users.json - make sure you fill in the right details here found on PAD cloud!
 */

const mysql = require("mysql");
const users = require("./config/users.json");

module.exports = {

    init() {
        if (!users) {
            console.log("Error: Could not load 'users.json', please make a copy of 'users.template.json'!");
            return;
        }

        let connectionPool;

        //TODO: different config for localhost
        //connection limit
        connectionPool = mysql.createPool({
            host: users.host,
            user: users.username,
            password: users.password,
            database: users.database,
            connectionLimit : 10,
            timezone: "UTC",
            multipleStatements: true
        });

        connectionPool.on('error', (err) => {
            console.log(`error while creating mysql pool err: ${err}`);
            throw err;
        });

        return connectionPool;
    },

    /**
     * Use this function for all queries to database - see example in app.js
     * @param connectionPool
     * @param data containt query with "?" parameters(values)
     * @param successCallback - function to execute when query succeeds
     * @param errorCallback - function to execute when query fails
     */
    handleQuery(connectionPool, data, successCallback, errorCallback) {
        connectionPool.query({
            sql: data.query,
            values: data.values,
            timeout: users.timeout
        }, (error, results) => {
            if (error) {
                errorCallback(error);
            } else {
                successCallback(results);
            }
        });
    }

};
