import WebSocketManager from '../utils/webSocketManager.js'
import { CustomEventTarget } from '../utils/alfa.js'

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
    this.ws = await WebSocketManager.connect()
    this.ws.onopen = () => {
      // put messages from the server into the msgs array
      this.ws.onmessage = msg => {
        let data = JSON.parse(msg.data)
        this._messages.push(data)
        this.dispatch('message', data)
      }
    }
  }

  // get all messages sent in this session
  getAll() {
    return this._messages
  }

  // the name of the logged in user
  getFrom() {
    return this._from
  }

  getTo() {
    return this._to;
  }

  set to(value) {
    this._to = value;
  }

// send a message to the other person
  send(content) {
    this.ws.send(JSON.stringify({ content, from: this._from, to: this._to }))
  }
}
