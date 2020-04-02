/**
 * Database connection pool with MySQL
 *
 * This class uses config from config/users.json - make sure you fill in the right details there found on PAD cloud!
 *
 * @author Pim Meijer & Lennard Fonteijn
 */
const mysql = require("mysql");
const dbConfig = serverConfig.database;

/**
 * Makes a connection to the database. Only do this once in application lifecycle.
 */
function init() {
    console.log(dbConfig);

    if(!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
        console.log(`Error: '${serverConfigFile}' not configured! Please fill in your team's credentials!`);

        return;
    }

    let connectionPool;

    connectionPool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionLimit : dbConfig.connectionLimit, //NOTE: Each team only has a maximum of 10 connections, this includes MySQL Workbench connections.
        timezone: "UTC",
        multipleStatements: true
    });

    //Quicktest connection for errors
    connectionPool.getConnection((err, conn) => {
        if(err) {
            console.log(err);
            console.log(`${err.errno} ${err.code}: ${err.sqlMessage}`);
        } else {
            conn.release();
        }
    });

    return connectionPool;
}

/**
 * Use this function for all queries to database - see example in app.js
 * @param connectionPool
 * @param data contains query with "?" parameters(values)
 * @param successCallback - function to execute when query succeeds
 * @param errorCallback - function to execute when query fails
 */
function handleQuery(connectionPool, data, successCallback, errorCallback) {
    connectionPool.query({
        sql: data.query,
        values: data.values,
        timeout: dbConfig.timeout
    }, (error, results) => {
        if (error) {
            console.log(error);
            errorCallback(error);
        } else {
            successCallback(results);
        }
    });
}

module.exports = {
    init,
    handleQuery
};
