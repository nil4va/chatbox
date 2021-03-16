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
        let res = await fetch('views/chat.html')
        let html = await res.text()
        this.view = html;
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
            console.log(msg);

        })
    }

    async previewData() {
        qs('.pinnedList').innerHTML = ''
        qs('.chatList').innerHTML = ''
        const data = await this.chatListRepository.getAll()
        const chronologicalOrder = data.sort(function (a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp)
        })
        console.log(data)
        for (let [i, chat] of chronologicalOrder.entries()) {
            let chatElement = ce(
                "div", {
                    onclick: e => {
                        this.chatRepository.to = chat.username
                        this.showMessages()
                    },
                    className:
                        'previewChat',
                    innerHTML: `<div class="row">
                    <div class="profilePicture"></div>
                    <div>
                        <div class="userName">${chat.username}</div>
                        <div class="lastMessage">${chat.content.slice(0, 25) + "..."}</div>
                        <div class="timeStamp">${new Date(chat.timestamp).toLocaleString()}</div>
                        <div class="chatOptions"><span>${
                        sessionManager.get('pinList').includes(chat.username)
                            ? '📌'
                            : "pin chat"
                    }</span></div>
                    </div>
                </div>`,
                })
            chatElement.$(".chatOptions").on("click", e => {
                if (!sessionManager.get("pinList").includes(chat.username) ) {
                    this.chatListRepository.pinChat(chat.username)
                    this.previewData()
                }else if (sessionManager.get("pinList").includes(chat.username) ) {
                    this.chatListRepository.unpinChat(chat.username)
                    this.previewData()
                }
            })

            if (sessionManager.get("pinList").includes(chat.username) ) {
                qs(".pinnedList").prepend(chatElement);
            } else {
                qs(".chatList").append(chatElement)
            }

            $('.previewChat').on('click', function () {
                $('.previewChat').removeClass('selected');
                $(this).addClass('selected');
            });

        }
    }
}

window.ChatController = ChatController
