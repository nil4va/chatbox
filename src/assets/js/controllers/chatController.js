import ChatRepository from '../repositories/chatRepository.js'
import {ce, getQuery, qs} from '../utils/alfa.js'
import chatRepository from "../repositories/chatRepository.js";

class ChatController {
    constructor(to = 'server') {
        console.log(to);
        const from = sessionManager.get("username") || 'test';
        this.chatRepository = new ChatRepository(from, to)
        this.chatListRepository = new ChatListRepository();
        this.init()
    }

    async init(data) {
        // this.chatView = $(data);
        // this.chatView.find(".previewChat").on("click", e => )
        let res = await fetch('views/chat.html')
        let html = await res.text()
        qs('.content').innerHTML = html
        this.showMessages()
        await this.previewData()
        this.chatRepository.on('message', e => {
            this.showMessages()
            console.log(e)
            if (e.detail.from === sessionManager.get("username"))
            this.previewData()
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

    async previewData() {
        qs('.chatList').innerHTML = ''
        const data = await this.chatListRepository.getAll()
        console.log(data)

        for (const chat of data) {
            const chatElement = ce(
                "div", {
                    onclick: e => {
                        console.log(this.chatRepository.send(this._to))
                        this.chatRepository.to = chat.username
                        this.showMessages()
                    },
                    className:
                        'previewChat',
                    innerHTML: `<div class="row">
                    <div class="profilePicture"></div>
                    <div>
                        <div class="userName">${chat.username}</div>
                        <div class="lastMessage">${chat.content}</div>
                        <div class="timeStamp">${chat.timestamp}</div>
                    </div>
                </div>`,
                })
            qs(".chatList").append(chatElement);
        }
    }
}

window.ChatController = ChatController
