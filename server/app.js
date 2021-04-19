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
app.use(bodyParser.urlencoded({ extended: false }))
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

  db.handleQuery(
    connectionPool,
    {
      query:
        'SELECT username, password, salt FROM user WHERE username = ?',
      values: [username],
    },
    data => {
      if (data.length === 1) {
        if (cryptoHelper.validatePassword(data[0].password, req.body.password, data[0].salt)){
          res.status(httpOkCode).json({ username: data[0].username })
        } else {
          res
              .status(authorizationErrCode)
              .json({ reason: 'Wrong username or password' })
        }
      } else {
        //wrong username
        res
          .status(authorizationErrCode)
          .json({ reason: 'Wrong username or password' })
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
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
    err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/register/add', (req, res) => {
  const username = req.body.username
  const email = req.body.email
  const passwordAndSalt = cryptoHelper.hashPassword(req.body.password)
  const hashedPassword = passwordAndSalt.passwordHash;
  const salt = passwordAndSalt.salt;

  db.handleQuery(
    connectionPool,
    {
      query: 'INSERT INTO user(username,email, password, salt) VALUES(?,?,?,?)',
      values: [username, email, hashedPassword, salt],
    },
    data => {
      if (data.insertId) {
        res.status(httpOkCode).json({ id: data.insertId })
      } else {
        res
          .status(badRequestCode)
          .json({ reason: 'Something went wrong, no record inserted' })
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

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
    err => res.status(badRequestCode).json({ reason: err })
  )
})

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
    err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/upload', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(badRequestCode)
      .json({ reason: 'No files were uploaded.' })
  }

  let sampleFile = req.files.sampleFile

  sampleFile.mv(wwwrootPath + '/uploads/test.jpg', function (err) {
    if (err) {
      return res.status(badRequestCode).json({ reason: err })
    }

    return res.status(httpOkCode).json('OK')
  })
})
//------- END ROUTES -------

app.get('/gateway', (req, res) => {
  res
    .status(httpOkCode)
    .json({ gateway: `ws://localhost:${WSS_PORT}${WSS_PATH}` })
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
        res.status(badRequestCode).json({ reason: 'Post not found' })
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

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
        res.status(badRequestCode).json({ reason: 'No posts found' })
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/profile', (req, res) => {
  db.handleQuery(
    connectionPool,
    {
      query:
        'INSERT INTO profile(firstname,lastname,emailadress,phoneNumber,bio) VALUES (?,?,?,?,?)',
      values: [
        req.body.firstname,
        req.body.lastname,
        req.body.emailadress,
        req.body.phoneNumber,
        req.body.bio,
      ],
    },
    data => {
      if (data.insertId) {
        res.status(httpOkCode).json({ id: data.insertId })
      } else {
        res.status(badRequestCode).json({ reason: 'Profile is not complete' })
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
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
}

function sendMsg(ws, type, data) {
  ws.send(JSON.stringify({ type, data }))
}

function sendError(ws, type, data) {
  sendMsg(ws, MSGTYPES.ERROR, { type, data })
}

function sendSuccess(ws, type, data) {
  sendMsg(ws, MSGTYPES.SUCCESS, { type, data })
}

// create new websocket server
const wss = new WebSocket.Server({ port: WSS_PORT, path: WSS_PATH })

// listen for new connections
wss.on('connection', ws => {
  console.log('new connection')
  // listen for messages from client
  ws.on('close', function close() {
    db.handleQuery(connectionPool, {
      query: 'UPDATE `user` SET `isOnline` = 0 WHERE id = ?',
      values: [ws.id],
    })
  })
  ws.on('message', async msg => {
    let { type, data } = JSON.parse(msg)
    console.log(type, data)
    let receiverID
    if (data.receiver) receiverID = await nameToId(data.receiver)
    if (data.sender) senderID = await nameToId(data.sender)
    switch (type) {
      case MSGTYPES.MESSAGE:
        // add a timestamp to the message
        data = { ...data, timestamp: Date.now() }
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
    }
    // console.log(data)
  })

  sendSuccess(ws, 'connection')
})

async function identifyWS(ws, data) {
  let fromId = await nameToId(data.name)
  ws.id = fromId
  db.handleQuery(
    connectionPool,
    {
      query: 'UPDATE `user` SET `isOnline` = 1 WHERE id = ?',
      values: [fromId],
    },
    suc => {
      sendSuccess(ws, MSGTYPES.IDENTIFY, data)
      //   sendMsg(ws, `server echo: ${data.content}`, 'server')
    },
    err => {
      sendError(ws, MSGTYPES.IDENTIFY, { ...data, err })
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
        sendError(ws, MSGTYPES.MESSAGE, { ...data, err })
      }
    )
  })
}

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
        'SELECT message.id as id, status, u1.username sender, u2.username receiver, content, timestamp, liked FROM message INNER JOIN user u1 ON `from` = u1.id INNER JOIN user u2 ON `to` = u2.id WHERE `from` = ? AND `to` = ? OR `from` = ? AND `to` = ? ORDER BY timestamp;',
      values: [id1, id2, id2, id1],
    },
    data => {
      res.status(httpOkCode).json(data)
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

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
      res.status(badRequestCode).json({ reason: err })
    }
  )
})

app.post('/chatList/pin', async (req, res) => {
  const loggedInName = req.body.userIdLoggedIn
  const recieverName = req.body.otherUserName
  console.log(recieverName, loggedInName)
  const recieverId = await nameToId(recieverName)
  const id = await nameToId(loggedInName)
  db.handleQuery(
    connectionPool,
    {
      query:
        'UPDATE `chat` SET `sender` = ?,`reciever` = ?, `isPinned` = 1 WHERE `sender` = ? AND `reciever` = ?',
      values: [id, recieverId, id, recieverId],
    },
    data => {
      console.log(data)
      if (data) {
        res.status(httpOkCode).json(data)
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/chatList/pin', async (req, res) => {
  const loggedInName = req.body.userIdLoggedIn
  const recieverName = req.body.otherUserName
  const recieverId = await nameToId(recieverName)
  const id = await nameToId(loggedInName)
  console.log(recieverId)
  console.log('hello')
  db.handleQuery(
    (connectionPool,
    {
      query: 'INSERT INTO chat (sender, reciever, isPinned) VALUES (?,?, 1)',
      values: [id, recieverId],
    },
    data => {
      console.log(data)
      if (data) {
        res.status(httpOkCode).json(data)
      }
    },
    err => res.status(badRequestCode).json({ reason: err }))
  )
})
app.post('/isOnlineList', (req, res) => {
  db.handleQuery(
    connectionPool,
    {
      query: 'SELECT * FROM `user` WHERE `isOnline` = 1',
    },
    data => {
      if (data) {
        res.status(httpOkCode).json(data)
      }
    },
    err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/liking/like', (req, res) => {
  const messageId = req.body.message;
  db.handleQuery(
      connectionPool,
      {
        query: 'UPDATE message SET liked = 1 WHERE id=?',
        values: [messageId],
      },
      data => {
          res.status(httpOkCode).json(data)
      },
      err => res.status(badRequestCode).json({ reason: err })
  )
})

app.post('/liking/unlike', (req, res) => {
  const messageId = req.body.message;
  db.handleQuery(
      connectionPool,
      {
        query: 'UPDATE message SET liked = 0 WHERE id=?',
        values: [messageId],
      },
      data => {
        res.status(httpOkCode).json(data)
      },
      err => res.status(badRequestCode).json({ reason: err })
  )
})

module.exports = app
