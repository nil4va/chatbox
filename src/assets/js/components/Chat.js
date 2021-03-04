import { Component, html } from '../../vendors/preact/preact.js'
import { fetchJSON, qs } from '../utils/alfa.js'
import WebSocketManager from '../utils/webSocketManager.js'

export default class Chat extends Component {
  constructor() {
    super()
    // initalize empty array for messages
    this.state = {
      msgs: [],
    }
  }

  async componentDidMount() {
    let { self = 'test', other = 'server' } = this.props
    this.setState({ self, other })
    this.ws = await WebSocketManager.connect()
    this.ws.onopen = () => {
      // put messages from the server into the msgs array
      this.ws.onmessage = msg => {
        let data = JSON.parse(msg.data)
        console.log(data)
        let { msgs } = this.state
        msgs.push(data)
        this.setState({ msgs })
      }
    }
  }

  sendMsg(content) {
    let { self, other } = this.state
    // send a message to the other person
    this.ws.send(JSON.stringify({ content, from: self, to: other }))
  }

  render({ children, self = 'test', ...props }, { msgs }) {
    return html`
      <div class="chat">
        <div class="history">
          ${
            // render all the messages
            msgs.map(
              msg => html`
                <div class="msg ${msg.from === self ? 'msgself' : 'msgother'}">
                  <p>${msg.content}</p>
                </div>
              `
            )
          }
        </div>

        <div class="row">
          <input
            id="msginput"
            placeholder="Type a message"
            onchange=${e => this.sendMsg(e.target.value)}
          />
          <button onclick=${e => this.sendMsg(qs('#msginput').value)}>
            Send
          </button>
        </div>
      </div>
    `
  }
}
