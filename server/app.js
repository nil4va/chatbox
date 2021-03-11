/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer
 */
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const db = require('./utils/databaseHelper')
const cryptoHelper = require('./utils/cryptoHelper')
const corsConfig = require('./utils/corsConfigHelper')
const app = express()
const fileUpload = require('express-fileupload')
const WebSocket = require('ws')

const WSS_PORT = 8080
const WSS_PATH = '/'

//logger lib  - 'short' is basic logging info
app.use(morgan('short'))

//init mysql connectionpool
const connectionPool = db.init()

//parsing request bodies from json to javascript objects
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//CORS config - Cross Origin Requests
app.use(corsConfig)

//File uploads
app.use(fileUpload())

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200
const badRequestCode = 400
const authorizationErrCode = 401

app.post('/user/login', (req, res) => {
    const username = req.body.username

    //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)
    const password = req.body.password

    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT username, password FROM user WHERE username = ? AND password = ?',
            values: [username, password],
        },
        data => {
            if (data.length === 1) {
                //return just the username for now, never send password back!
                res.status(httpOkCode).json({username: data[0].username})
            } else {
                //wrong username
                res
                    .status(authorizationErrCode)
                    .json({reason: 'Wrong username or password'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

//dummy data example - rooms
app.post('/room_example', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT id, surface FROM room_example WHERE id = ?',
            values: [req.body.id],
        },
        data => {
            //just give all data back as json
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

app.post('/upload', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res
            .status(badRequestCode)
            .json({reason: 'No files were uploaded.'})
    }

    let sampleFile = req.files.sampleFile

    sampleFile.mv(wwwrootPath + '/uploads/test.jpg', function (err) {
        if (err) {
            return res.status(badRequestCode).json({reason: err})
        }

        return res.status(httpOkCode).json('OK')
    })
})
//------- END ROUTES -------

app.get('/gateway', (req, res) => {
    res
        .status(httpOkCode)
        .json({gateway: `ws://localhost:${WSS_PORT}${WSS_PATH}`})
})

app.post('/posts/:id', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT title, context, username FROM post INNER JOIN user ON post.creatorId = user.id WHERE postId = ?',
            values: [req.params.id],
        },
        data => {
            if (data.length === 1) {
                res.status(httpOkCode).json({
                    title: data[0].title,
                    context: data[0].context,
                    creator: data[0].username,
                })
            } else {
                res
                    .status(badRequestCode)
                    .json({reason: 'Post not found'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

app.post('/posts', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT postId, title FROM post',
        },
        data => {
            if (data.length > 0) {
                let json = data.map(item => ({
                    postId: item.postId,
                    title: item.title
                }))

                res.status(httpOkCode).json(json)
            } else {
                res
                    .status(badRequestCode)
                    .json({reason: 'No posts found'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// create new websocket server
const wss = new WebSocket.Server({port: WSS_PORT, path: WSS_PATH})

function sendMsg(ws, content, from) {
    ws.send(JSON.stringify({content, from}))
}

const USERIDMAP = {}

// gets the id for a username
function nameToId(name) {
    if (!name) return
    return new Promise(resolve => {
        if (USERIDMAP[name]) return resolve(USERIDMAP[name])
        db.handleQuery(
            connectionPool,
            {
                query: 'SELECT id FROM user WHERE username = ?',
                values: [name],
            },
            data => {
                if (data.length === 1) {
                    USERIDMAP[name] = data[0].id
                    resolve(data[0].id)
                } else {
                    resolve(null)
                }
            },
            err => {
                resolve(null)
            }
        )
    })
}

// listen for new connections
wss.on('connection', ws => {
    console.log('new connection')
    // listen for messages from client
    ws.on('message', async msg => {
        let data = JSON.parse(msg)
        console.log(data)
        let fromId = await nameToId(data.from)
        let toId = await nameToId(data.to)
        db.handleQuery(
            connectionPool,
            {
                query: 'INSERT INTO message (`from`,`to`,content) VALUES (?,?,?)',
                values: [fromId, toId, data.content],
            },
            suc => {
                sendMsg(ws, {content:data.content,timestamp: new Date()}, data.from)
                sendMsg(ws, {content:`server echo: ${data.content}`, timestamp: new Date()}, 'server')
            },
            err => {
                console.log(err)
                sendMsg(ws, 'database error', 'server')
            }
        )
    })

    sendMsg(ws, 'websocket connect success', 'server')
})

app.post("/chatList", async (req, res) => {
    const loggedInName = req.body.userIdLoggedIn
    const id = await nameToId(loggedInName)
    db.handleQuery(connectionPool, {
        query: "SELECT `user`.`username`, `content`, MAX(timestamp) AS `timestamp` FROM `message` INNER JOIN user ON" +
            " `to` =" +
            " `user`.`id` WHERE `from` = ? GROUP BY `to`",
        values: [id],
    }, data => {
        console.log(data)
        if (data) {
            res.status(httpOkCode).json(
                data
            )
        }
    }, (err) => err => res.status(badRequestCode).json({reason: err}))
})

app.post("/chatList/pin", async (req, res) => {
    const loggedInName = req.body.userIdLoggedIn
    const recieverName = req.body.otherUserName
    console.log(recieverName, loggedInName)
    const recieverId = await nameToId(recieverName)
    const id = await nameToId(loggedInName)
    db.handleQuery(connectionPool, {
        query: "UPDATE `chat` SET `sender` = ?,`reciever` = ?, `isPinned` = 1 WHERE `sender` = ? AND `reciever` = ?",
        values: [id, recieverId, id, recieverId],
    }, data => {
        console.log(data)
        if (data) {
            res.status(httpOkCode).json(
                data
            )
        }
    }, (err) => err => res.status(badRequestCode).json({reason: err}))
})

app.post("/chatList/pin", async (req, res) => {
    const loggedInName = req.body.userIdLoggedIn
    const recieverName = req.body.otherUserName
    const recieverId = await nameToId(recieverName)
    const id = await nameToId(loggedInName)
    db.handleQuery((connectionPool, {
        query: "INSERT INTO chat (sender, reciever) VALUES (?,?)",
        values: [id, recieverId],
    }, data => {
        console.log(data)
        if (data) {
            res.status(httpOkCode).json(
                data
            )
        }
    }, (err) => err => res.status(badRequestCode).json({reason: err})))
})


module.exports = app


