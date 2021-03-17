import WebSocketManager, { TYPES } from '../utils/webSocketManager.js'
import { CustomEventTarget } from '../utils/alfa.js'
import SimpleWebSocket from '../utils/webSocketManager.js'

/**
 * @author Alfa Saijers
 */
export default class ChatRepository extends CustomEventTarget {
  constructor(from, to) {
    super()
    this._from = from
    this._to = to
    this._messages = []
    this.initWebSocket()
  }

  // initialize the websocket connection
  async initWebSocket() {
    this.ws = new SimpleWebSocket()
    this.ws.on('message', ({ detail: { type, data } }) => {
      switch (type) {
        case TYPES.MESSAGE:
          this._messages.push(data)
      }
      this.dispatch('message', { type, data })
    })
  }

  // get all messages sent in this session
  getAll() {
    return this._messages.filter(v => v.to == this._to)
  }

  // the name of the logged in user
  getFrom() {
    return this._from
  }
  getTo() {
    return this._to
  }

  set to(value) {
    this._to = value
  }

  // send a message to the other person
  send(content) {
    var d = new Date()
    var a = d.toLocaleString()

    content = content + ' <br> ' + a
    // console.log('msg out:', content)
    let data = { content, from: this._from, to: this._to }
    this._messages.push(data)
    this.ws.send(TYPES.MESSAGE, data)
  }

  startTyping() {
    this.ws.send(TYPES.TYPING, { from: this._from, to: this._to, typing: true })
  }

  stopTyping() {
    this.ws.send(TYPES.TYPING, {
      from: this._from,
      to: this._to,
      typing: false,
    })
  }
}
