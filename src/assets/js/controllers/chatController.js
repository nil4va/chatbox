import { html, render } from '../../vendors/preact/preact.js'
import Chat from '../components/Chat.js'
import { qs } from '../utils/alfa.js'

class ChatController {
  constructor() {
    qs('.content').innerHTML = ''
    render(
      html`
        <${Chat} />
      `,
      qs('.content')
    )
  }
}

window.ChatController = ChatController
