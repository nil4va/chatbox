import { Component, html } from '../../vendors/preact/preact.js'
import { fetchJSON } from '../utils/alfa.js'
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
    this.ws = await WebSocketManager.connect()
    this.ws.onopen = () => {
      // put messages from the server into the msgs array
      this.ws.onmessage = msg => {
        let data = JSON.parse(msg.data)
        let { msgs } = this.state
        msgs.push(data)
        this.setState({ msgs })
      }
    }
  }

  render({ children, self = '', other = '', ...props }, { msgs }) {
    return html`
      <div class="chat">
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
        <input
          id="msginput"
          onchange=${e => {
            // send the message to the server
            this.ws.send(
              JSON.stringify({ content: e.target.value, from: self })
            )
          }}
        />
      </div>
    `
  }
}
