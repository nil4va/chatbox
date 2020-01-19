const mysql = require("mysql");
const config = require("./config/config.json");
const users = require("./config/users.json",);

module.exports = {

    init() {
        if (config === typeof undefined) {
            console.log("Error: Could not load 'config.json', please make a copy of 'config.template.json'!")
            return;
        } else if (users === typeof undefined) {
            console.log("Error: Could not load 'users.json', please make a copy of 'users.template.json'!");
            return;
        }

        let connectionPool;

        connectionPool = mysql.createPool({
            host: config.database.host,
            user: users.username,
            password: users.password,
            database: users.database,
            timezone: "UTC"
        });

        connectionPool.on('error', function (err) {
            console.log("error while creating mysql pool err: " + err);
            throw err;
        });

        return connectionPool;
    },

    handleQuery(connectionPool, data, successCallback, errorCallback) {
        connectionPool.query({
            sql: data.query,
            values: data.values,
            timeout: config.database.timeout
        }, function (error, results) {
            if (error) {
                errorCallback(error);
            } else {
                successCallback(results);
            }
        });
    }

};
