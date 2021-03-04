import { html, render } from '../../vendors/preact/preact.js'
import Chat from '../components/Chat.js'
import ChatRepository from '../repositories/chatRepository.js'
import { qs } from '../utils/alfa.js'

class ChatController {
  constructor() {
    this.chatRepository = new ChatRepository('test', 'server')
    qs('.content').innerHTML = ''
    this.render()
    this.chatRepository.on('message', e => {
      this.render()
    })
  }
  render() {
    render(
      html`
        <${Chat} chatRepository=${this.chatRepository} />
      `,
      qs('.content')
    )
  }
}

window.ChatController = ChatController
