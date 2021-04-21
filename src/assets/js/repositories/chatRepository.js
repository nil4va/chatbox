import WebSocketManager, { TYPES } from '../utils/webSocketManager.js'
import { CustomEventTarget } from '../utils/alfa.js'
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
    // this.initWebSocket()
  }

  // get all messages sent in this session
  async getAll() {
    const data = await networkManager.doRequest('/history', {
      receiver: this._receiver,
      sender: this._sender,
    })
    return data
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

    // content = content + ' <br> ' + a
    // console.log('msg out:', content)
    let data = { content, sender: this._sender, receiver: this._receiver }
    // this._messages.push(data)
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
    this.ws.send(TYPES.EDIT,{
      sender: this._sender,
      receiver: this._receiver,
      content, id
        }
    )
    await networkManager.doRequest('/edit', {
      content, id
    })
  }
}
