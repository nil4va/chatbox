import ChatRepository from '../repositories/chatRepository.js'
import { ce, qs } from '../utils/alfa.js'
/**
 * @author Alfa Saijers
 */
class ChatController {
  constructor() {
    this.chatRepository = new ChatRepository('test', 'server')
    this.setup()
  }

  async setup() {
    let res = await fetch('views/chat.html')
    let html = await res.text()
    console.log(html)
    qs('.content').innerHTML = html

    this.showMessages()
    this.chatRepository.on('message', e => {
      this.showMessages()
    })

    qs('#msgsend').onclick = e =>
      this.chatRepository.send(qs('#msginput').value)
  }

  // render all the messages
  showMessages() {
    qs('.history').innerHTML = ''
    this.chatRepository.getAll().map(msg => {
      qs('.history').append(
        ce('div', {
          className:
            'msg ' +
            (msg.from === this.chatRepository.getFrom()
              ? 'msgself'
              : 'msgother'),
          innerHTML: `<p>${msg.content}</p>`,
        })
      )
    })
  }
}

window.ChatController = ChatController
