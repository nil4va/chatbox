import ChatRepository from '../repositories/chatRepository.js'
import {ce, getQuery, qs} from '../utils/alfa.js'
import chatRepository from "../repositories/chatRepository.js";

class ChatController {
  constructor( to = 'server') {
    console.log(to);
    const from = sessionManager.get("username") || 'test';
    this.chatRepository = new ChatRepository(from, to)
    this.init()
  }

  async init() {
    let res = await fetch('views/chat.html')
    let html = await res.text()
    qs('.content').innerHTML = html
    this.showMessages()
    this.chatRepository.on('message', e => {
      this.showMessages()
    })
    qs('#msgsend').onclick = e =>
      this.chatRepository.send(qs('#msginput').value)
  }

  showMessages() {
    // render all the messages
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
