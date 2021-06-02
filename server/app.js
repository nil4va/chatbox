/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer, Alfa sayers, Maud de Jong and Nilava Kazal
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
const path = require('path')
const fs = require('fs')
const {static} = require('express')

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
app.use(static(wwwrootPath))
// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200
const badRequestCode = 400
const authorizationErrCode = 401

if (!fs.existsSync(wwwrootPath + '/uploads/'))
    fs.mkdirSync(wwwrootPath + '/uploads/')

if (!fs.existsSync(wwwrootPath + '/uploads/profile'))
    fs.mkdirSync(wwwrootPath + '/uploads/profile')

// checks if credentials for login are correct. returns the username
app.post('/user/login', (req, res) => {
    const username = req.body.username

    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT username, password FROM user WHERE username = ?',
            values: [username],
        },
        async data => {
            if (data.length === 1) {
                if (
                    await cryptoHelper.validatePassword(
                        req.body.password,
                        data[0].password
                    )
                ) {
                    res.status(httpOkCode).json({username: data[0].username})
                } else {
                    res
                        .status(authorizationErrCode)
                        .json({reason: 'Wrong username or password'})
                }
            } else {
                //wrong username
                res
                    .status(authorizationErrCode)
                    .json({reason: "Username doesn't exist"})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// adds a user to the db with a salted version of the pw. returns the userid
app.post('/register/add', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const hashedPw = await cryptoHelper.hashPassword(req.body.password);

    db.handleQuery(
        connectionPool,
        {
            query: 'INSERT INTO user(username,email, password, dateJoined) VALUES(?,?,?,CURDATE())',
            values: [username, email, hashedPw],
        },
        data => {
            if (data.insertId) {
                res.status(httpOkCode).json({id: data.insertId})
            } else {
                res
                    .status(badRequestCode)
                    .json({reason: 'Something went wrong, no record inserted'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// checks if the username is already in use. Returns true if there is no one with that username
app.post('/register/name', (req, res) => {
    const username = req.body.username

    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT * FROM user WHERE username = ?',
            values: [username],
        },
        data => {
            return res.status(httpOkCode).json(data.length !== 0)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// checks if the email is already in use. Returns true if there is no one with that email
app.post('/register/mail', (req, res) => {
    const email = req.body.email

    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT * FROM user WHERE email = ?',
            values: [email],
        },
        data => {
            return res.status(httpOkCode).json(data.length !== 0)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// saves a file in the uploads folder
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res
            .status(badRequestCode)
            .json({reason: 'No files were uploaded.'})
    }
    let paths = []
    for (const [key, file] of Object.entries(req.files)) {
        let file_path = path.parse(file.name)
        let server_path = `uploads/${new Date().getTime()}-${file_path.name}${
            file_path.ext
        }`
        paths.push(server_path)
        file.mv(wwwrootPath + server_path, err => console.log(err))
    }
    res.status(httpOkCode).json({files: paths})
})

// Returns the values that belong to a certain post
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
                res.status(badRequestCode).json({reason: 'Post not found'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// Returns the id and title of every post in the db
app.post('/posts', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT postId, title FROM post',
        },
        data => {
            if (data.length > 0) {
                let json = data.map(item => ({
                    postId: item.postId,
                    title: item.title,
                }))

                res.status(httpOkCode).json(json)
            } else {
                res.status(badRequestCode).json({reason: 'No posts found'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// edits the content of a message and sets the edited value to 1
app.post('/edit', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: 'UPDATE message SET content = ?, edited = 1 WHERE id = ?',
            values: [req.body.content, req.body.id],
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// gets the previous messages from a certain chat
app.post('/history', async (req, res) => {
    const id1 = await nameToId(req.body.receiver)
    const id2 = await nameToId(req.body.sender)
    db.handleQuery(connectionPool, {
        query: 'UPDATE message SET status = 1 WHERE `to` = ? AND `from` = ?',
        values: [id2, id1],
    })
    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT message.id as id, status, u1.username sender, u2.username receiver, content, timestamp, liked, edited FROM message INNER JOIN user u1 ON `from` = u1.id INNER JOIN user u2 ON `to` = u2.id WHERE `from` = ? AND `to` = ? OR `from` = ? AND `to` = ? ORDER BY timestamp;',
            values: [id1, id2, id2, id1],
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// gets the last message from every chat the logged in user is a part of
app.post('/chatList', async (req, res) => {
    const loggedInName = req.body.userIdLoggedIn
    const id = await nameToId(loggedInName)
    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT a.timestamp, a.content, u1.username receiver, u2.username sender FROM `message` a INNER JOIN(SELECT MAX(id) id FROM `message` WHERE `to` = ? or `from` = ? group by `to`, `from`) b ON a.id = b.id INNER JOIN user u1 ON a.`to` = u1.id INNER JOIN user u2 ON a.`from` = u2.id ORDER BY b.id desc',
            values: [id, id],
        },
        data => {
            if (data) {
                let reg = new Set()
                data = data.reduce((a, c) => {
                    let other = c.receiver === loggedInName ? c.sender : c.receiver
                    if (!reg.has(other)) {
                        reg.add(other)
                        a.push(c)
                    }
                    return a
                }, [])
                res.status(httpOkCode).json(data)
            }
        },
        err => {
            res.status(badRequestCode).json({reason: err})
        }
    )
})

// gets a list of all online users
app.post('/isOnlineList', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: 'SELECT `username` FROM `user` WHERE `isOnline` = 1',
        },
        data => {
            if (data) {
                res.status(httpOkCode).json(data)
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// likes a certain message
app.post('/liking/like', (req, res) => {
    const messageId = req.body.message
    db.handleQuery(
        connectionPool,
        {
            query: 'UPDATE message SET liked = 1 WHERE id=?',
            values: [messageId],
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// unlikes a certain message
app.post('/liking/unlike', (req, res) => {
    const messageId = req.body.message
    db.handleQuery(
        connectionPool,
        {
            query: 'UPDATE message SET liked = 0 WHERE id=?',
            values: [messageId],
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// gets all badges a certain user has earned
app.post('/badge', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query:
                'SELECT `badgeNr` FROM `badge` INNER JOIN `user` ON badge.user = user.id WHERE user.username = ?',
            values: [req.body.username],
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// checks if user has been online for the past 7 days
app.post('/badge/online', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: "SELECT `date` FROM online_badge INNER JOIN `user` ON online_badge.userId = user.id WHERE user.username = ?",
            values: [req.body.username]
        },
        data => {
            if (data.length === 7) {
                res.status(httpOkCode)
                return badgeAdd({'username': req.body.username, 'badgeNr': 1}, res)

            } else {
                res.status(httpOkCode)
                return badgeRemove({'username': req.body.username, 'badgeNr': 1}, res)
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

//checks if a user has talked to min 3 users last month
app.post('/badge/popular', async (req, res) => {
    const userId = await nameToId(req.body.username);

    db.handleQuery(
        connectionPool,
        {
            query: "SELECT `from`, `to`, `timestamp`, DATEDIFF(CURRENT_DATE, FROM_UNIXTIME(timestamp / 1000)) AS diff FROM message WHERE (`from` = ? OR `to` = ?) AND (DATEDIFF(CURRENT_DATE, FROM_UNIXTIME(timestamp / 1000)) < 31)",
            values: [userId, userId]
        },
        data => {
            const users = new Set();
            for (let entry of data) {
                users.add(entry.from)
                users.add(entry.to)
            }
            if (users.size > 3) {
                res.status(httpOkCode)
                return badgeAdd({'username': req.body.username, 'badgeNr': 2}, res)

            } else {
                res.status(httpOkCode)
                return badgeRemove({'username': req.body.username, 'badgeNr': 2}, res)
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// checks if a user has replied within an hour in the last 7 days
app.post('/badge/fast', async (req, res) => {
    const userId = await nameToId(req.body.username);
    db.handleQuery(
        connectionPool,
        {
            query: "SELECT `from`, `to`, `timestamp` FROM message WHERE DATEDIFF(CURRENT_DATE, FROM_UNIXTIME(timestamp / 1000)) < 7 AND (`from` = ? OR `to` = ?)",
            values: [userId, userId]
        },
        data => {
            const from = [];
            const to = []
            for (let message of data) {
                if (message.from === userId) {
                    from.push(message)
                } else {
                    to.push(message)
                }
            }

            let repliedFast = false;
            for (let msgTo of to) {
                for (let msgFrom of from) {
                    const replyTime = new Date(msgFrom.timestamp).setHours(new Date(msgFrom.timestamp).getHours() + 1);

                    if (new Date(msgTo.timestamp) < replyTime) {
                        repliedFast = true;
                    }
                }
            }
            res.status(httpOkCode)
            return repliedFast ? badgeAdd({
                'username': req.body.username,
                'badgeNr': 3
            }, res) : badgeRemove({"username": req.body.username, "badgeNr": 3}, res)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// checks if user joined over a year ago
app.post('/badge/og', (req, res) => {

    db.handleQuery(
        connectionPool,
        {
            query: "SELECT dateJoined FROM user WHERE username = ?",
            values: [req.body.username]
        },
        data => {
            var oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (data[0].dateJoined < oneYearAgo) {
                res.status(httpOkCode)
                return badgeAdd({'username': req.body.username, 'badgeNr': 4}, res)

            } else {
                res.status(httpOkCode)
                return badgeRemove({'username': req.body.username, 'badgeNr': 4}, res)
            }

        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// adds a badge to the db
const badgeAdd = async (req, res) => {
    const userId = await nameToId(req.username);
    db.handleQuery(
        connectionPool,
        {
            query: "INSERT IGNORE INTO badge VALUES (?,?)",
            values: [req.badgeNr, userId]
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
}

// removes a badge from the db
const badgeRemove = async (req, res) => {
    const userId = await nameToId(req.username);
    db.handleQuery(
        connectionPool,
        {
            query: "DELETE FROM badge WHERE user = ? AND badgeNr = ?",
            values: [userId, req.badgeNr]
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
}

//get all chats from/to the user that contain a certain string
app.post('/chat', async (req, res) => {
    const stringValue = '%' + req.body.value + '%'
    db.handleQuery(
        connectionPool,
        {
            query: "SELECT `from`, `to`, `timestamp`, `content`, `to`.`username` AS `receiver`, `from`.`username` AS" +
                " `sender`, `message`.`id` FROM message INNER JOIN `user` AS `to` ON `to`.`id` = `message`.`to` INNER" +
                " JOIN" +
                " `user` AS `from` ON `from`.`id` = `message`.`from` WHERE `CONTENT` LIKE ? AND (`to`.`username` = ? OR `from`.`username` = ?)",
            values: [stringValue, req.body.username, req.body.username]
        },
        data => {
            res.status(httpOkCode).json(data)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// get the firstname , lastname and bio from a certain user
app.post('/profile/info', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: "SELECT firstName, lastName, bio FROM user WHERE username = ?",
            values: [req.body.username]
        },
        data => {
            if (data.length > 0) {
                res.status(httpOkCode).json(data[0])
            } else {
                res.status(500).json({reason: 'no data returned'})
            }
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// update a users first name
app.post('/profile/firstname', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: "UPDATE user SET firstName = ? WHERE username = ?",
            values: [req.body.firstName, req.body.username]
        },
        data => {
            res.status(httpOkCode)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// update a users last name
app.post('/profile/lastname', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: "UPDATE user SET lastName = ? WHERE username = ?",
            values: [req.body.lastName, req.body.username]
        },
        data => {
            res.status(httpOkCode)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})

// update a users bio
app.post('/profile/bio', (req, res) => {
    db.handleQuery(
        connectionPool,
        {
            query: "UPDATE user SET bio = ? WHERE username = ?",
            values: [req.body.bio, req.body.username]
        },
        data => {
            res.status(httpOkCode)
        },
        err => res.status(badRequestCode).json({reason: err})
    )
})
// update a users profile picture
app.post('/profile/profilePicture', (req, res) => {
    let profilePicture = req.files.profilePicture

    profilePicture.mv(wwwrootPath + '/uploads/profile/' + req.body.username + '.dat', function (err) {
        if (err) {
            return res.status(badRequestCode).json({reason: err})
        }
        return res.status(httpOkCode).json('OK')
    })
})

const USERIDMAP = {}

// converts a name to an id
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

const MSGTYPES = {
    MESSAGE: 'message',
    ERROR: 'error',
    SUCCESS: 'success',
    IDENTIFY: 'identify',
    TYPING: 'typing',
    SEEN: 'seen',
    LIKE: 'like',
    EDIT: 'edit',
}

function sendMsg(ws, type, data) {
    ws.send(JSON.stringify({type, data}))
}

function sendError(ws, type, data) {
    sendMsg(ws, MSGTYPES.ERROR, {type, data})
}

function sendSuccess(ws, type, data) {
    sendMsg(ws, MSGTYPES.SUCCESS, {type, data})
}

// create new websocket server
const wss = new WebSocket.Server({port: WSS_PORT, path: WSS_PATH})

// listen for new connections
wss.on('connection', ws => {
    // listen for messages from client
    ws.on('close', function close() {
        db.handleQuery(connectionPool, {
            query: 'UPDATE `user` SET `isOnline` = 0 WHERE id = ?',
            values: [ws.id],
        })
    })
    ws.on('message', async msg => {
        let {type, data} = JSON.parse(msg)
        let receiverID
        if (data.receiver) receiverID = await nameToId(data.receiver)
        if (data.sender) senderID = await nameToId(data.sender)
        switch (type) {
            case MSGTYPES.MESSAGE:
                // add a timestamp to the message
                data = {...data, timestamp: Date.now()}
                // put the messae in the database, and get the id
                data = await putMessageInDB(ws, data)
                // send the message to all clients that match toId
                for (const client of wss.clients) {
                    if (client.id === receiverID) {
                        sendMsg(client, MSGTYPES.MESSAGE, data)
                    }
                }
                break
            case MSGTYPES.IDENTIFY:
                identifyWS(ws, data)
                break
            case MSGTYPES.TYPING:
                for (const client of wss.clients) {
                    if (client.id === receiverID) {
                        sendMsg(client, MSGTYPES.TYPING, data)
                    }
                }
                break
            case MSGTYPES.SEEN:
                for (const client of wss.clients) {
                    // let the sender of the message know it has been seen
                    if (client.id === senderID) {
                        sendMsg(client, MSGTYPES.SEEN, data)
                    }
                }
                break
            case MSGTYPES.LIKE:
                for (const client of wss.clients) {
                    // let the sender of the message know it has been seen
                    if (client.id === receiverID) {
                        sendMsg(client, MSGTYPES.LIKE, data)
                    }
                }
                break
            case MSGTYPES.EDIT:
                for (const client of wss.clients) {
                    if (client.id === receiverID) {
                        sendMsg(client, MSGTYPES.EDIT, data)
                    }
                }
        }
    })

    sendSuccess(ws, 'connection')
})

async function identifyWS(ws, data) {
    let fromId = await nameToId(data.name)
    ws.id = fromId
    db.handleQuery(
        connectionPool,
        {
            query: 'UPDATE `user` SET `isOnline` = 1 WHERE id = ?; INSERT IGNORE INTO online_badge VALUES (?, CURRENT_DATE)',
            values: [fromId, fromId, fromId],
        },
        suc => {
            sendSuccess(ws, MSGTYPES.IDENTIFY, data)
            //   sendMsg(ws, `server echo: ${data.content}`, 'server')
        },
        err => {
            sendError(ws, MSGTYPES.IDENTIFY, {...data, err})
        }
    )
}

async function putMessageInDB(ws, data) {
    let fromId = await nameToId(data.sender)
    let toId = await nameToId(data.receiver)
    data.status = 0
    return new Promise(resolve => {
        db.handleQuery(
            connectionPool,
            {
                query:
                    'INSERT INTO message (`from`,`to`,content,timestamp,status) VALUES (?,?,?,?,?)',
                values: [fromId, toId, data.content, data.timestamp, 0],
            },
            suc => {
                data.id = suc.insertId
                sendSuccess(ws, MSGTYPES.MESSAGE, data)
                resolve(data)
                //   sendMsg(ws, `server echo: ${data.content}`, 'server')
            },
            err => {
                sendError(ws, MSGTYPES.MESSAGE, {...data, err})
            }
        )
    })
}

module.exports = app
module.exports.wss = wss
