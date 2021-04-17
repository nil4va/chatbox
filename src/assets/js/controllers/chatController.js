import ChatRepository from '../repositories/chatRepository.js'
import { ce, getQuery, LinkedList, qs, qsa } from '../utils/alfa.js'
import SimpleWebSocket, { TYPES } from '../utils/webSocketManager.js'

const MSG_STATUS = {
  0: 'sent',
  1: 'seen',
}

class ChatController {
  constructor(to) {
    const from = sessionManager.get('username')
    this.chatRepository = new ChatRepository(from, to)
    this.chatListRepository = new ChatListRepository()
    // this.webSocket = new SimpleWebSocket()
    this._hasSelectedAChat = !!to

    this.init()
  }

  async init(data) {
    let res = await fetch('views/chat.html')
    let html = await res.text()
    this.view = html
    qs('.content').innerHTML = html

    await this.previewData()
    this.onceAfterSelectFirstChat()

    if (this._hasSelectedAChat) {
      this.showMessages()
    } else {
      qs('.chatwindow').style.display = 'none'
    }
  }

  onceAfterSelectFirstChat() {
    this._hasSelectedAChat = true
    qs('.chatwindow').style.display = ''
    this.chatRepository.ws.on('message', ({ type, data }) => {
      if (!this._hasSelectedAChat) return
      switch (type) {
        case TYPES.SUCCESS:
          switch (data.type) {
            case TYPES.MESSAGE:
              this.addMessage(data.data)
              this.scrollToLastMessage()
              this.previewData()
          }
          break
        case TYPES.MESSAGE:
          this.chatRepository.ws.send(TYPES.SEEN, data)
          this.addMessage(data)
          this.scrollToLastMessage()
          this.previewData()
          break
        case TYPES.TYPING:
          console.log(data)
          if (data.sender === this.chatRepository.getTo()) {
            if (data.typing) {
              qs('.typing').textContent = `${data.sender} is typing...`
            } else {
              qs('.typing').textContent = ''
            }
          }
      }
    })
    qs('#msgsend').onclick = async e => {
      this.chatRepository.send(qs('#msginput').value)
      qs('#msginput').value = ''
      qs('#msginput').focus()
    }
    let timeout = null
    qs('#msginput').oninput = e => {
      this.chatRepository.startTyping()
      clearTimeout(timeout)
      timeout = setTimeout(h => {
        this.chatRepository.stopTyping()
      }, 1000)
    }
  }

  async showMessages() {
    console.log('getting all messages')
    // render all the messages
    qs('.username').textContent = this.chatRepository.getTo()
    qs('.history').innerHTML = ''
    const messages = await this.chatRepository.getAll()
    messages.map(msg => this.addMessage(msg))
    this.scrollToLastMessage()
  }

  addMessage(msg) {
    qs('.history').append(
      ce('div', {
        className:
          'msg ' +
          (msg.sender === this.chatRepository.getFrom()
            ? 'msgself'
            : 'msgother'),
        innerHTML: `<div class="message">
            <p class="content">${msg.content}</p>
            <p class="timestamp">${new Date(msg.timestamp).toLocaleString()}</p>
            ${
              msg.sender === this.chatRepository.getFrom()
                ? `<p class="status">${MSG_STATUS[msg.status]}</p>`
                : ''
            }
            </div>
          `,
      })
    )
  }

  scrollToLastMessage() {
    let el = qsa('.history .msg').pop()
    el?.scrollIntoView()
  }

  async previewData() {
    if (this.isWorking) return
    this.isWorking = true
    qs('.pinnedList').innerHTML = ''
    qs('.chatList').innerHTML = ''
    const data = await this.chatListRepository.getAll()
    if (data.length == 0) {
      return
    }
    const onlineList = [] || (await this.chatListRepository.getOnlineList())
    const chronologicalOrder = data.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
    console.log(data)
    for (let [i, chat] of chronologicalOrder.entries()) {
      let otherPerson =
        chat.receiver === sessionManager.get('username')
          ? chat.sender
          : chat.receiver

      let chatElement = ce('div', {
        onclick: e => {
          this.chatRepository.to = otherPerson
          if (!this._hasSelectedAChat) this.onceAfterSelectFirstChat()
          this.showMessages()
        },
        className:
          'previewChat ' +
          (this.chatRepository.getTo() === otherPerson ? 'selected' : ''),
        innerHTML: `<div class="row">
                    <div class="profilePicture"></div>
                    <div>
                        <div class="indicator ${
                          onlineList.includes(otherPerson)
                            ? 'online'
                            : 'offline'
                        }"></div>
                        <div class="userName">${otherPerson}</div>
                        <div class="lastMessage">${chat.content.slice(
                          0,
                          25
                        )}</div>
                        <div class="timeStamp">${new Date(
                          chat.timestamp
                        ).toLocaleString()}</div>
                        <div class="chatOptions"><span>${
                          sessionManager.get('pinList').includes(otherPerson)
                            ? '📌'
                            : 'pin chat'
                        }</span></div>
                    </div>
                </div>`,
      })

      chatElement.$('.chatOptions').on('click', e => {
        if (!sessionManager.get('pinList').includes(otherPerson)) {
          this.chatListRepository.pinChat(otherPerson)
        } else {
          this.chatListRepository.unpinChat(otherPerson)
        }
        this.previewData()
      })

      if (sessionManager.get('pinList').includes(otherPerson)) {
        qs('.pinnedList').prepend(chatElement)
      } else {
        qs('.chatList').append(chatElement)
      }

      $('.previewChat').on('click', function () {
        $('.previewChat').removeClass('selected')
        $(this).addClass('selected')
      })
    }
    this.isWorking = false

    // searchbox for users
    $('.searchbox').on('keyup', function () {
      const value = $(this).val().toLowerCase()
      $(this)
        .parent()
        .parent()
        .find('.userName')
        .filter(function () {
          $(this)
            .parent()
            .parent()
            .parent()
            .toggle($(this).text().toLowerCase().indexOf(value) > -1)
        })
    })

    // searchbox for messages

    function classActive(message) {
      $('.activeMessage').removeClass('activeMessage')
      $(message).addClass('activeMessage')
      message.scrollIntoView()
    }

    var matchedMessages
    $('.searchbox1').on('keyup', function () {
      const value = new RegExp($(this).val().toLowerCase())
      $('.activeMessage').removeClass('activeMessage')
      if ($(this).val() === '') return
      matchedMessages = $(this)
        .parent()
        .parent()
        .find('.msg')
        .filter(function () {
          return value.test($(this).text().toLowerCase())
        })
        .toArray()

      console.log(matchedMessages)
      matchedMessages = new LinkedList(...matchedMessages)
      classActive(matchedMessages.tail.value)
    })

    $('#buttonUp').on('click', function () {
      const message = matchedMessages.prev.value
      classActive(message)
    })

    $('#buttonDown').on('click', function () {
      const message = matchedMessages.next.value

      classActive(message)
    })
  }
}

window.ChatController = ChatController
