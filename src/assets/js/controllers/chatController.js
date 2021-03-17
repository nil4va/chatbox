import ChatRepository from '../repositories/chatRepository.js'
import { ce, getQuery, qs } from '../utils/alfa.js'
import SimpleWebSocket, { TYPES } from '../utils/webSocketManager.js'

class ChatController {
  constructor(to) {
    const from = sessionManager.get('username')
    this.chatRepository = new ChatRepository(from, to)
    this.chatListRepository = new ChatListRepository()
    this.webSocket = new SimpleWebSocket()
    this._hasSelectedAChat = !!to

    this.init()
  }

  async init(data) {
    let res = await fetch('views/chat.html')
    let html = await res.text()
    this.view = html
    qs('.content').innerHTML = html
    await this.previewData()

    if (this._hasSelectedAChat) {
      this.showMessages()
    } else {
      qs('.chatwindow').style.display = 'none'
    }
  }

  onceAfterSelectFirstChat() {
    this._hasSelectedAChat = true
    qs('.chatwindow').style.display = ''
    this.chatRepository.on('message', ({ detail: { type, data } }) => {
      if (!this._hasSelectedAChat) return
      switch (type) {
        case TYPES.MESSAGE:
          this.showMessages()
          this.previewData()
          break
        case TYPES.TYPING:
          if (data.from === this.chatRepository.getFrom()) {
            if (data.typing) {
              qs('.typing').textContent = `${data.from} is typing...`
            } else {
              qs('.typing').textContent = ''
            }
          }
      }
    })
    qs('#msgsend').onclick = e => {
      this.chatRepository.send(qs('#msginput').value)
      qs('#msginput').value = ''
      qs('#msginput').focus()
      this.showMessages()
      this.previewData()
    }
    let timeout = null
    qs('#msginput').oninput = e => {
      this.chatRepository.startTyping()
      clearTimeout(timeout)
      timeout = setTimeout(h => {
        this.chatRepository.stopTyping()
      }, 2000)
    }
  }

  showMessages() {
    // render all the messages
    qs('.username').textContent = this.chatRepository.getTo()
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
      console.log(msg)
    })
  }

  async previewData() {
    qs('.pinnedList').innerHTML = ''
    qs('.chatList').innerHTML = ''
    const data = await this.chatListRepository.getAll()
    const onlineList = await this.chatListRepository.getOnlineList()
    const chronologicalOrder = data.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
    console.log(data)
    for (let [i, chat] of chronologicalOrder.entries()) {
      let chatElement = ce('div', {
        onclick: e => {
          this.chatRepository.to = chat.username
          if (!this._hasSelectedAChat) this.onceAfterSelectFirstChat()
          this.showMessages()
        },
        className:
          'previewChat ' +
          (this.chatRepository.getTo() === chat.username ? 'selected' : ''),
        innerHTML: `<div class="row">
                    <div class="profilePicture"></div>
                    <div>
                        <div class="indicator ${
                          onlineList.includes(chat.username)
                            ? 'online'
                            : 'offline'
                        }"></div>
                        <div class="userName">${chat.username}</div>
                        <div class="lastMessage">${
                          chat.content.slice(0, 25) + '...'
                        }</div>
                        <div class="timeStamp">${new Date(
                          chat.timestamp
                        ).toLocaleString()}</div>
                        <div class="chatOptions"><span>${
                          sessionManager.get('pinList').includes(chat.username)
                            ? '📌'
                            : 'pin chat'
                        }</span></div>
                    </div>
                </div>`,
      })
      chatElement.$('.chatOptions').on('click', e => {
        if (!sessionManager.get('pinList').includes(chat.username)) {
          this.chatListRepository.pinChat(chat.username)
          this.previewData()
        } else if (sessionManager.get('pinList').includes(chat.username)) {
          this.chatListRepository.unpinChat(chat.username)
          this.previewData()
        }
      })

      if (sessionManager.get('pinList').includes(chat.username)) {
        qs('.pinnedList').prepend(chatElement)
      } else {
        qs('.chatList').append(chatElement)
      }

      $('.previewChat').on('click', function () {
        $('.previewChat').removeClass('selected')
        $(this).addClass('selected')
      })
    }
  }
}

window.ChatController = ChatController
