/**
 * @author Pim Meijer
 * @type entry point of application - contains all server config and api endpoints
 */

const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cryptoHelper = require("./utils/cryptoHelper");
const corsConfig = require("./utils/corsConfig");
const app = express();

//logger lib for dev only - 'short' is basic logging info
//TODO: if dev..
app.use(morgan('short'));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to js
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//CORS config - Cross Origin Requests
app.use(corsConfig);

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200;
const badRequestCode = 400;
const authorizationErrCode = 401;

app.post('/user/login', (req, res) => {
    const username = req.body.username;

    //TODO: we cant receive a password unencrypted!! Use cryptohelpers :)
    const password = req.body.password;

    db.handleQuery(connectionPool, {
        query: "SELECT username, password FROM user WHERE username = ? AND password = ?",
        values: [username, password]
    }, (data) => {
        if (data.length === 1) {
            //return just the username for now, never send password back!
            res.status(httpOkCode).json({"username": data[0].username});
        } else {
            //wrong username
            res.status(authorizationErrCode).json({reason: "Wrong username or password"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//dummy data example - kamers
app.post('/kamer', (req, res) => {

    db.handleQuery(connectionPool, {
            query: "SELECT kamercode, oppervlakte FROM kamer WHERE kamercode = ?",
            values: [req.body.kamercode]
        }, (data) => {
            //just give all data back as json
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    );

});
//------- END ROUTES -------

module.exports = app;

