const express = safeRequire('express')
const db = safeRequire('./db', 'could not load db config');
const bodyParser = safeRequire('body-parser', 'could not load bodyparser');
const morgan = require('morgan')

const app = express();

//logger lib
app.use(morgan('short'))

//init mysql
const connectionPool = db.init();

//parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
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

// ROUTES - add all api endpoints here
app.get('/login', (req, res) => {
    const username = req.body.username

    //TODO: we cant send password unencrypted!!
    const password = req.body.password;
});

app.post('/kamers', (req, res) => {

    db.handleQuery(connectionPool,{
        query: "SELECT * FROM kamer WHERE kamercode = ?",
        values: [req.body.kamercode]
    }, (data) => {
        console.log(data);
        res.status(200).json(data);
    }, (err) => console.log(err));

});

//END ROUTES

function safeRequire(module, errorMessage) {
    try {
        return require(module);
    }
    catch (e) {
        console.log(e);
        console.log(errorMessage);

        return undefined;
    }
}

module.exports = app;


