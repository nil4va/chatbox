import ChatRepository from '../repositories/chatRepository.js'
import {ce, getQuery, LinkedList, qs, qsa} from '../utils/alfa.js'
import SimpleWebSocket, {TYPES} from '../utils/webSocketManager.js'

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
            this.showMessages()
            this.onceAfterSelectFirstChat()
        } else {
            qs('.chatwindow').style.display = 'none'
        }
    }

    onceAfterSelectFirstChat() {
        this._hasSelectedAChat = true
        qs('.chatwindow').style.display = ''
        this.chatRepository.ws.on('message', ({type, data}) => {
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
            var msgInputField = $('#msginput').val();

            if (msgInputField.length === 0 ||!msgInputField.trim()) {
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
        return messages
    }

    addMessage(msg) {
        qsa('.status').map(v => (v.textContent = ''))
        const msgFromUser = msg.sender === this.chatRepository.getFrom()
        const messageElement = ce('div', {
            id: 'msg_' + msg.id,
            className:
                'msg ' +
                (msgFromUser ? 'msgself ' : 'msgother ') +
                (msg.liked === 0 ? 'notLiked' : 'liked'),
            innerHTML:
                `<div class="message">
    <span class="d-flex"> ${msgFromUser ? '<i class="fas fa-edit edit"></i>' : ''}` +
                (msgFromUser ? `` : `<p class="content">${msg.content}</p>`) +
                (msg.liked === 1
                    ? `<img src="assets/img/likes/filledHeart.png" alt="liked" class="like">`
                    : msg.sender !== this.chatRepository.getFrom()
                        ? `<img src="assets/img/likes/emptyHeart.png" alt="not liked" class="like">`
                        : ``) +
                (msgFromUser ? `<div class="contentdiv"><p class="content">${msg.content}</p></div>` : ``) +
                ` </span>
            <p class="timestamp">${new Date(msg.timestamp).toLocaleString()}</p>
            ${
                    msg.sender === this.chatRepository.getFrom()
                        ? `<p class="status">${MSG_STATUS[msg.status]}</p>`
                        : ''
                }
            </div>
          `,
        })
        qs('.history').append(messageElement)

        let like = msg.liked
        messageElement.$('.like')?.on('click', () => {
            if (like === 1 && msg.sender !== this.chatRepository.getFrom()) {
                this.chatRepository.unlike(msg.id)
                messageElement.$('img').src = 'assets/img/likes/emptyHeart.png'
                messageElement.classList.replace('liked', 'notLiked');
                like = 0
            } else {
                this.chatRepository.like(msg.id)
                messageElement.$('img').src = 'assets/img/likes/filledHeart.png'
                messageElement.classList.replace('notLiked', 'liked');
                like = 1
            }
        })
        messageElement.$('.edit')?.on('click', () => {
            messageElement.$('.contentdiv').innerHTML = `<input id="msgEdit" value=${msg.content}>`
            messageElement.$('#msgEdit')?.on('keydown', (e) => {
                if (e.key === 'Enter') {
                    msg.content = e.target.value
                    this.chatRepository.edit(e.target.value, msg.id)
                    messageElement.$('.contentdiv').innerHTML = `<p class="content">${e.target.value}</p>`
                }
            })
        })
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
        if (data.length === 0) {
            return
        }

        const onlineList = (await this.chatListRepository.getOnlineList()) || []
        const chronologicalOrder = data.sort(function (a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp)
        })
        for (let [i, chat] of chronologicalOrder.entries()) {
            let sliceContent;
            if (chat.content.length > 40) {
                sliceContent = chat.content.slice(0, 40) + "..."
            } else {
                sliceContent = chat.content
            }

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
                },
                className:
                    'previewChat ' +
                    (this.chatRepository.getTo() === otherPerson ? 'selected' : ''),
                innerHTML: ` <div class = "row">
            <div class="profilePicture"></div>
        <div>
            <div class="userName">${otherPerson}
                <div class="indicator ${
                    onlineList.find(
                        person => person.username === otherPerson
                    ) !== undefined
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

            $('.previewChat').on('click', function () {
                $('.previewChat').removeClass('selected')
                $(this).addClass('selected')
                qs('.searchbox1').value = ''
                $('#buttonDown').hide()
                $('#buttonUp').hide()
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
            if (message)
                message.scrollIntoView()
        }

        let matchedMessages
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

            matchedMessages = new LinkedList(...matchedMessages)
            classActive(matchedMessages.tail.value)

            if (matchedMessages.length === 0) {
                $('#buttonUp').hide()
                $('#buttonDown').hide()
            } else {
                $('#buttonUp').show()
                $('#buttonDown').show()
            }
        })

        $('.searchbox1').on('input', function () {
            if (!$('.searchbox1').val()) {
                $('#buttonUp').hide()
                $('#buttonDown').hide()
            }
        })

        $('#buttonUp').on('click', function () {
            const message = matchedMessages.prev.value
            classActive(message)
        })

        $('#buttonDown').on('click', function () {
            const message = matchedMessages.next.value
            classActive(message)
        })

        $('.searchbox1').hide()
        $('.searchMessage').on('click', function () {
            $('.searchbox1').show().focus()
            $('.searchbox1').on('focusout', function () {
                $('.searchbox1').hide()
                $('#buttonUp').hide()
                $('#buttonDown').hide()
            })
        })
    }
}

window.ChatController = ChatController
