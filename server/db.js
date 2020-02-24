/**
 * @author Pim Meijer & Lennard Fonteijn
 * Database connection pool with MySQL
 * This class uses config from config/users.json - make sure you fill in the right details there found on PAD cloud!
 */

const mysql = require("mysql");
const users = require("./config/users.json");

module.exports = {

    /**
     * Makes a connection to the database. Only do this once in application lifecycle.
     */
    init() {
        if(!users.host || !users.database || !users.username || !users.password) {
            console.log("Error: 'config/users.json' not configured! Please fill in your team's credentials!");
            return;
        }

        let connectionPool;

        //TODO: different config for localhost
        connectionPool = mysql.createPool({
            host: users.host,
            user: users.username,
            password: users.password,
            database: users.database,
            connectionLimit : 10, //dont change this limit!! database connections are limited per team
            timezone: "UTC",
            multipleStatements: true
        });

        //quicktest connection for errors
        connectionPool.getConnection((err, conn) => {
            if(err) {
                console.log(`${err.errno} ${err.code}: ${err.sqlMessage}`);
            } else {
                conn.release();
            }
        });

        return connectionPool;
    },

    /**
     * Use this function for all queries to database - see example in app.js
     * @param connectionPool
     * @param data contains query with "?" parameters(values)
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
