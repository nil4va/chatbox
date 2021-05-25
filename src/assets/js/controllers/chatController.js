import ChatRepository from '../repositories/chatRepository.js'
import { ce, getQuery, LinkedList, qs, qsa } from '../utils/alfa.js'
import UrlPreview from '../utils/urlPreview.js'
import SimpleWebSocket, { TYPES } from '../utils/webSocketManager.js'

const MSG_STATUS = {
  0: 'sent',
  1: 'seen',
}

const rUrl = /((ftp|http|https):\/\/[^ "\n]+|(?<!\/)uploads\/.*)/g,
  rImg = /\.(jpg|png|gif)($|&)/i

class ChatController {
  constructor(to) {
    const from = sessionManager.get('username')
    this.chatRepository = new ChatRepository(from, to)
    this.chatListRepository = new ChatListRepository()
    this.badgeRepository = new badgeRepository()
    // this.webSocket = new SimpleWebSocket()
    this._hasSelectedAChat = !!to

    this.init()
    window.chatController = this
  }

  async init(data) {
    let res = await fetch('views/chat.html')
    let html = await res.text()
    this.view = html
    qs('.content').innerHTML = html

    await this.previewData()
    let firstChat = qs('.previewChat')
    if (firstChat && !this._hasSelectedAChat) {
      console.log('click')
      firstChat.click()
    } else if (this._hasSelectedAChat) {
      this.showBadges()
      this.showMessages()
      this.onceAfterSelectFirstChat()
    } else {
      qs('.chatwindow').style.display = 'none'
    }

    let upzone = qs('#upzone')
    qs('.chatwindow').on('dragenter', e => {
      e.stopPropagation()
      e.preventDefault()
      upzone.classList.add('shown')
    })
    upzone.on('dragleave', e => {
      e.stopPropagation()
      e.preventDefault()
      upzone.classList.remove('shown')
    })
    upzone.on('dragover', e => {
      e.stopPropagation()
      e.preventDefault()
    })
    upzone.on('drop', async e => {
      e.preventDefault()
      e.stopPropagation()
      upzone.classList.remove('shown')
      let file_paths = await this.chatRepository.uploadFiles(
        e.dataTransfer.files
      )
      for (const path of file_paths) {
        this.chatRepository.send(path)
      }
    })
    const upfile = qs('#upfile')
    upfile.onchange = async e => {
      e.preventDefault()
      e.stopPropagation()
      let file_paths = await this.chatRepository.uploadFiles(e.target.files)
      Array.from(file_paths).map(v => this.chatRepository.send(v))
    }
    qs('#uploadButton').onclick = e => upfile.click()
    this.filesHidden = true
    qs('#openFileFolder').onclick = _ => this.toggleFiles(this.filesHidden)
  }

  toggleFiles(filesHidden) {
    if (filesHidden) {
      qs('#fileFolder').style.display = ''
      qs('.history').style.display = 'none'
      qs('#openFileFolder').textContent = 'history'
      let fc = qs('.files')
      fc.innerHTML = ''
      let files = qsa('.msg .content img').map(v => v.src)
      qs('#fileCounter').textContent = files.length
      files.reverse().map(v => fc.append(ce('img', { src: v })))
      this.filesHidden = false
    } else {
      qs('#fileFolder').style.display = 'none'
      qs('.history').style.display = ''
      qs('#openFileFolder').textContent = 'files'
      this.filesHidden = true
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
          if (data.sender === this.chatRepository.getTo()) {
            data.status = 1
            this.chatRepository.ws.send(TYPES.SEEN, data)
            this.addMessage(data)
            this.scrollToLastMessage()
            this.previewData()
          }
          break
        case TYPES.TYPING:
          if (data.sender === this.chatRepository.getTo()) {
            if (data.typing) {
              qs('.typing').textContent = `${data.sender} is typing...`
            } else {
              qs('.typing').textContent = ''
            }
          }
          break
        case TYPES.SEEN:
          if (data.receiver === this.chatRepository.getTo()) {
            let el = qs('#msg_' + data.id)
            if (el) el.$('.status').textContent = 'seen'
          }
          break
        case TYPES.LIKE:
          let el = qs('#msg_' + data.messageId)
          if (data.like && el) {
            el.$('img').src = 'assets/img/likes/filledHeart.png'
          } else if (el) {
            el.$('img').src = 'assets/img/likes/emptyHeart.png'
          }
          break
        case TYPES.EDIT:
          let el2 = qs('#msg_' + data.id)
          el2.$('.content').textContent = data.content
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

    qs('#msgsend').disabled = true

    $('#msginput').on('input', function () {
      var msgInputField = $('#msginput').val()

      if (msgInputField.length === 0 || !msgInputField.trim()) {
        qs('#msgsend').disabled = true
      } else {
        qs('#msgsend').disabled = false
      }
    })
  }

  async showMessages() {
    // render all the messages
    qs('.username').textContent = this.chatRepository.getTo()
    qs('.history').innerHTML = ''
    const messages = await this.chatRepository.getAll()
    messages.map(msg => this.addMessage(msg))
    this.scrollToLastMessage()
    $('.likedMsg').on('click', function () {
      $('#likesModal').show()
      $('#likesBody').html('')
      // const messages = this.chatRepository.getAll()
      let atLeastOneLiked = false
      for (let i = 0; i < messages.length; i++) {
        let message = messages[i]
        if (
          message.liked === 1 &&
          message.receiver === sessionManager.get('username')
        ) {
          atLeastOneLiked = true
          $('#likesBody').append(
            `<div class="msgother"> 
                            <div class="message ">
                                <span class="d-flex"> <p class="content">${
                                  message.content
                                }</p></span>
                                <p class="timestamp">${new Date(
                                  message.timestamp
                                ).toLocaleString()}</p>
                            </div>
                        </div>`
          )
        }
      }
      if (!atLeastOneLiked) {
        $('#likesBody').html("You haven't yet liked anything in this chat.")
      }
    })
    $('#likesClose').on('click', function () {
      $('#likesModal').hide()
    })
    window.onclick = function (event) {
      if (event.target === document.getElementById('likesModal')) {
        $('#likesModal').hide()
      }
    }
    return messages
  }

  getImages(msg) {
    msg.content = decodeURIComponent(msg.content)
    let imgCont = ce('div', { className: 'fcol' })
    if (!rUrl.test(msg.content)) return imgCont
    for (const match of msg.content.match(rUrl)) {
      if (!match) continue
      let url = match
      console.log(url)
      msg.content = msg.content.replace(match, '')
      if (rImg.test(url)) {
        // remove image urls from content
        let img = new Image()
        img.onload = e => {
          this.scrollToLastMessage()
        }
        img.src = url
        imgCont.append(img)
      } else {
        UrlPreview.load(url).then(v => {
          console.log(v)
          let c = qs(`#msg_${msg.id} .content`)
          c.$$('a')
            .filter(v => v.href.trim() == url.trim())
            .map(v => (v.outerHTML = ''))
          c.append(v)
          this.scrollToLastMessage()
        })
      }
    }
    // msg.content = msg.content.replace(rUrl, '<a href="$1">$1</a>')

    return imgCont
  }

  // transformUrls(msg) {
  // for (const match of msg.content.match)
  // }

  addMessage(msg) {
    let imageContainer = this.getImages(msg)
    // this.transformUrls(msg)
    qsa('.status').map(v => (v.textContent = ''))
    const msgFromSelf = msg.sender === this.chatRepository.getFrom()
    const c_msg = msgFromSelf ? 'msgself' : 'msgother'
    const c_like = msg.liked === 0 ? 'notLiked' : 'liked'
    const e_edit = msgFromSelf ? '<i class="fas fa-edit edit"></i>' : ''
    const e_msg = msgFromSelf
      ? `<div class="contentdiv"><p class="content">${msg.content}</p></div>`
      : `<p class="content">${msg.content}</p>`
    const e_like =
      msg.liked === 1
        ? `<img src="assets/img/likes/filledHeart.png" alt="liked" class="like">`
        : !msgFromSelf
        ? `<img src="assets/img/likes/emptyHeart.png" alt="not liked" class="like">`
        : ``
    const e_status = msgFromSelf
      ? `<p class="status">${MSG_STATUS[msg.status]}</p>`
      : ''
    const messageElement = ce('div', {
      id: 'msg_' + msg.id,
      className: `msg ${c_msg} ${c_like}`,
      innerHTML: `<div class="message">
          <span class="d-flex">
            ${
              msgFromSelf
                ? `${e_edit} ${e_like} ${e_msg}`
                : `${e_msg} ${e_like}`
            }
          </span>
          <p class="timestamp">${new Date(msg.timestamp).toLocaleString()} ${
        msg.edited === 1 ? ` (edited)` : ``
      }</p>
          ${e_status}
        </div>
        `,
    })
    qs('.history').append(messageElement)

    let like = msg.liked
    messageElement.$('.like')?.on('click', () => {
      if (like === 1 && msg.sender !== this.chatRepository.getFrom()) {
        this.chatRepository.unlike(msg.id)
        messageElement.$('img').src = 'assets/img/likes/emptyHeart.png'
        messageElement.classList.replace('liked', 'notLiked')
        like = 0
      } else {
        this.chatRepository.like(msg.id)
        messageElement.$('img').src = 'assets/img/likes/filledHeart.png'
        messageElement.classList.replace('notLiked', 'liked')
        like = 1
      }
    })
    messageElement.$('.edit')?.on('click', () => {
      messageElement.$(
        '.contentdiv'
      ).innerHTML = `<input id="msgEdit" value='${msg.content}'>`
      messageElement.$('#msgEdit')?.on('keydown', e => {
        if (e.key === 'Enter') {
          if (e.target.value.length !== 0 && !!e.target.value.trim()) {
            msg.content = e.target.value
            this.chatRepository.edit(e.target.value, msg.id)
            messageElement.$(
              '.contentdiv'
            ).innerHTML = `<p class="content">${e.target.value}</p>`

            const timestamp = messageElement.$('.timestamp')
            if (timestamp.innerHTML.indexOf('(edited)') === -1) {
              timestamp.append(' (edited)')
            }
          } else {
            messageElement.$(
              '.contentdiv'
            ).innerHTML = `<p class="content">${msg.content}</p>`
          }
        }
      })
    })
    messageElement.$('.content').append(imageContainer)
  }

  scrollToLastMessage() {
    let el = qsa('.history .msg').pop()
    el?.scrollIntoView()
  }

  async showBadges() {
    let otherPerson = this.chatRepository.getTo()

    const earnedBadges = await this.badgeRepository.getBadgeInfo(otherPerson)
    $('.badges').hide()
    Array.from(earnedBadges).forEach((elem, i) => {
      if (elem) $('#badge' + earnedBadges[i].badgeNr).show()
    })
  }

  async previewData() {
    if (this.isWorking) return
    this.isWorking = true
    qs('.pinnedList').innerHTML = ''
    qs('.chatList').innerHTML = ''
    const data = await this.chatListRepository.getAll()
    if (data.length === 0) {
      return
    }

    const onlineList = (await this.chatListRepository.getOnlineList()) || []
    const chronologicalOrder = data.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    for (let [i, chat] of chronologicalOrder.entries()) {
      let sliceContent = chat.content

      let otherPerson =
        chat.receiver === sessionManager.get('username')
          ? chat.sender
          : chat.receiver
      let chatElement = ce('div', {
        onclick: async e => {
          this.chatRepository.to = otherPerson
          if (!this._hasSelectedAChat) this.onceAfterSelectFirstChat()
          let messages = await this.showMessages()

          for (const m of messages.reverse()) {
            if (m.sender === this.chatRepository.getTo()) {
              this.chatRepository.ws.send(TYPES.SEEN, m)
              break
            }
          }
          this.toggleFiles(false)
        },
        className:
          'previewChat ' +
          (this.chatRepository.getTo() === otherPerson ? 'selected' : ''),
        innerHTML: ` <div class = "row">
            <div class="profilePicture"></div>
        <div>
            <div class="userName">${otherPerson}
                <div class="indicator ${
                  onlineList.find(person => person.username === otherPerson) !==
                  undefined
                    ? 'online'
                    : 'offline'
                }"></div></div>
                        <div class="lastMessage">${sliceContent}</div>
                        <div class="timeStamp">${new Date(
                          chat.timestamp
                        ).toLocaleString()}</div>
            <div class="chatOptions">
                <span>${
                  sessionManager.get('pinList').includes(otherPerson)
                    ? '<i class="fa fas fa-thumbtack"  style="color:red"></i>'
                    : '<i class="fa far fa-thumbtack"></i>'
                }</span>
            </div>
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
        e.stopPropagation()
      })

      if (sessionManager.get('pinList').includes(otherPerson)) {
        qs('.pinnedList').prepend(chatElement)
      } else {
        qs('.chatList').append(chatElement)
      }
    }

    function selectChat(e) {
      $('.previewChat').removeClass('selected')
      e.currentTarget.classList.add('selected')

      qs('.searchbox1').value = ''
      $('#buttonDown').hide()
      $('#buttonUp').hide()
      this.showBadges()
    }

    $('.previewChat').on('click', selectChat.bind(this))
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
          let previewChat = $('.previewChat')
          if ($('.chatList').find(previewChat).length > 0) {
            $('.chats').show()
            $('.messages').show()
          }
          if (value === '') {
            $('.chats').hide()
            $('.messages').hide()
          }

          if ($('.chatList, .pinnedList').children(':visible').length === 0) {
            $('.chats').hide()
          }
        })
    })

    // searchbox for messages
    function classActive(message) {
      $('.activeMessage').removeClass('activeMessage')
      $(message).addClass('activeMessage')
      if (message) message.scrollIntoView()
    }

    let matchedMessages

    $('#buttonUp').on('click', function () {
      const message = matchedMessages.prev.value
      classActive(message)
    })

    $('#buttonDown').on('click', function () {
      const message = matchedMessages.next.value
      classActive(message)
    })

    $('.searchMessageContainer').hide()

    $('.searchGlobalMessages').hide()

    $('.searchbox').on('keyup', async e => {
      const value = $('.searchbox').val()
      const allMessages = await this.chatRepository.allMessages(
        sessionManager.get('username'),
        value
      )
      console.log(allMessages)

      $('.messages').html('')

      let previewChatSearch = $('.previewChatSearch')

      if (allMessages.length > 0) {
        $('.searchGlobalMessages').show()
      } else {
        $('.searchGlobalMessages').hide()
      }

      if ($('.messages').find(previewChatSearch).length > 0) {
        $('.searchGlobalMessages').show()
      }
      if (value === '') {
        $('.searchGlobalMessages').hide()
      }

      if ($('.messages').length === 0) {
        $('.searchGlobalMessages').hide()
      }

      for (const message of allMessages) {
        //check who sent the message
        const theirMessage = message.receiver
        const ourMessage = allMessages.sender
        const messageOf = theirMessage ? theirMessage : ourMessage

        const content = message.content

        $('.messages').append(`
<div class = "row previewChatSearch previewChat">
    <div class="profilePicture"></div>
    <div>
        <div class="userName">${messageOf}</div>
        <div class="lastMessage">${content}</div>
        <div class="timeStamp">${new Date(
          message.timestamp
        ).toLocaleString()}</div>
    </div>
</div>`)
      }
    })

    this.isWorking = false
  }
}

window.ChatController = ChatController
