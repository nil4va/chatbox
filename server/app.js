const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cryptoHelper = require("./cryptoHelper");
const app = express();

//logger lib for dev only - 'short' is basic logging info
//TODO: if dev..
app.use(morgan('short'));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to js
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//CORS config
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }

    next();
});


// ------ ROUTES - add all api endpoints here ------
const badRequestCode = 400;
const httpOkCode = 200;


app.post('/login', (req, res) => {
    const username = req.body.username;

    //TODO: we cant receive a password unencrypted!!
    // const password = cryptoHelper.getHashedPassword(req.body.password);
    const password = req.body.password;

    db.handleQuery(connectionPool, {
        query: "SELECT username, password FROM user WHERE username = ? AND password = ?",
        values: [username, password]
    }, (data) => {
        if (data.length === 1) {
            console.log("login success: " + data[0].username);
            res.status(httpOkCode).json("success");
        } else {
            //wrong username
            res.status(401).json("Wrong username or password");
        }

    }, (err) => res.status(badRequestCode).json(err));
});

//dummy data example - kamers
app.post('/example', (req, res) => {

    db.handleQuery(connectionPool, {
            query: "SELECT * FROM kamer WHERE kamercode = ?",
            values: [req.body.kamercode]
        }, (data) => {
            console.log(data);
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json(err)
    );

});
//------- END ROUTES -------

module.exports = app;

