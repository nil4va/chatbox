import WebSocketManager from '../utils/webSocketManager.js'
import { CustomEventTarget } from '../utils/alfa.js'

export default class ChatRepository extends CustomEventTarget {
  constructor(from, to) {
    super()
    this._from = from
    this._to = to
    this._messages = []
    this.init()
  }
  async init() {
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

  getFrom() {
    return this._from
  }

  // send a message to the other person
  send(content) {
    this.ws.send(JSON.stringify({ content, from: this._from, to: this._to }))
  }
}
