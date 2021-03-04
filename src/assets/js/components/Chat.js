import { Component, html } from '../../vendors/preact/preact.js'
import { fetchJSON, qs } from '../utils/alfa.js'

export default class Chat extends Component {
  render({ children, chatRepository, ...props }, {}) {
    return html`
      <div class="chat">
        <div class="history">
          ${
            // render all the messages
            chatRepository.getAll().map(
              msg => html`
                <div
                  class="msg ${msg.from === chatRepository.getFrom()
                    ? 'msgself'
                    : 'msgother'}"
                >
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
            onchange=${e => chatRepository.send(e.target.value)}
          />
          <button onclick=${e => chatRepository.send(qs('#msginput').value)}>
            Send
          </button>
        </div>
      </div>
    `
  }
}
