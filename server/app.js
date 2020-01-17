const express = safeRequire('express');
const db = safeRequire('./db', 'could not load db config');
const bodyParser = safeRequire('body-parser', 'could not load bodyparser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();

//logger lib for dev only - 'short' is basic logging info
app.use(morgan('short'));

//init mysql connectionpool
const connectionPool = db.init();

//server side cookies
app.use(cookieParser());

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

//AUTH HELPER FUNCTIONS - TODO: Move
const requireAuth = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        console.log("give unauthorized error ")
    }
};

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
};

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
};


// ROUTES - add all api endpoints here


app.get('/login', (req, res) => {
    const username = req.body.username;
    //TODO: we cant receive a password unencrypted!!
    const password = getHashedPassword(req.body.password);

    db.handleQuery(connectionPool,{
        query: "SELECT * FROM user WHERE username = ? AND password = ?",
        values: [req.body.username, req.body.password]
    }, (data) => {
        //TODO: WIP Check for user retrieved from db
        console.log(data);
        res.cookie("authToken", generateAuthToken(), {maxAge: 360000});

    }, (err) => res.status(400).json(err));
});

app.post("/logout", (req, _) => {
    req.session.destroy(() => console.log("user logged out."));
});

app.post("/authdata", requireAuth, (req, res) => console.log("protected route"));

//dummy data
app.post('/kamers', (req, res) => {
    db.handleQuery(connectionPool,{
        query: "SELECT * FROM kamer WHERE kamercode = ?",
        values: [req.body.kamercode]
    }, (data) => {
        console.log(data);
        res.status(200).json(data);
    }, (err) => res.status(400).json(err)
);

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


