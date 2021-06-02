import WebSocketManager, { TYPES } from '../utils/webSocketManager.js'
import { CustomEventTarget, fetchJSON } from '../utils/alfa.js'
import SimpleWebSocket from '../utils/webSocketManager.js'

/**
 * @author Alfa Saijers
 */
export default class ChatRepository extends CustomEventTarget {
  constructor(sender, receiver) {
    super()
    this._sender = sender
    this._receiver = receiver
    this.ws = new SimpleWebSocket()
  }

  // get all messages sent in this session
  async getAll() {
    return await networkManager.doRequest('/history', {
      receiver: this._receiver,
      sender: this._sender,
    })
  }

  // the name of the logged in user
  getFrom() {
    return this._sender
  }
  getTo() {
    return this._receiver
  }

  getOther(name) {
    return name === this._sender ? this._receiver : this._sender
  }

  set to(value) {
    this._receiver = value
  }

  // send a message to the other person
  send(content) {
    var d = new Date()
    var a = d.toLocaleString()

    let data = { content, sender: this._sender, receiver: this._receiver }
    this.ws.send(TYPES.MESSAGE, data)
  }

  startTyping() {
    this.ws.send(TYPES.TYPING, {
      sender: this._sender,
      receiver: this._receiver,
      typing: true,
    })
  }

  stopTyping() {
    this.ws.send(TYPES.TYPING, {
      sender: this._sender,
      receiver: this._receiver,
      typing: false,
    })
  }

  async like(messageId) {
    this.ws.send(TYPES.LIKE, {
      sender: this._sender,
      receiver: this._receiver,
      messageId,
      like: true,
    })
    await networkManager.doRequest('/liking/like', {
      message: messageId,
    })
  }

  async unlike(messageId) {
    this.ws.send(TYPES.LIKE, {
      sender: this._sender,
      receiver: this._receiver,
      messageId,
      like: false,
    })
    await networkManager.doRequest('/liking/unlike', {
      message: messageId,
    })
  }
  async edit(content, id) {
      this.ws.send(TYPES.EDIT, {
        sender: this._sender,
      receiver: this._receiver,
      content,
      id,
    })
    await networkManager.doRequest('/edit', {
      content,
      id,
    })
  }

  async uploadFiles(files = []) {
    if (files.length < 1) return
    let fd = new FormData()
    for (const [i, file] of Array.from(files).entries()) {
      fd.append('file_' + i, file)
    }
    console.log(fd)
    let res = await fetchJSON(baseUrl + '/upload', { body: fd, method: 'POST' })
    return res.files
  }
  allMessages(username, value) {
    return networkManager
        .doRequest(`/chat`, {
          "username": username,
          "value": value
        }, "POST");
  }
}
