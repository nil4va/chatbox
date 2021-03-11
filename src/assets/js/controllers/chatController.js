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

    dateConvertion(number) {
        var d = new Date(number);
        var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
            d.getHours() + ":" + d.getMinutes();
        return datestring
    }

    async init(data) {
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
                    innerHTML: `<p>${msg.content.content}</p>
                                <p id="timer"><small></small></p>`,
                })
            )
            document.getElementById("timer").innerHTML = this.dateConvertion(msg.content.timestamp)
        })
    }

    async previewData() {
        qs('.chatList').innerHTML = ''
        const data = await this.chatListRepository.getAll()
        const chronologicalOrder = data.sort(function (a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp)
        })
        console.log(data)
        for (let [i,chat] of chronologicalOrder.entries()) {
            const chatElement = ce(
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
                        <div class="lastMessage">${chat.content}</div>
                        <div class="timeStamp">${new Date(chat.timestamp).toLocaleString()}</div>
                        <div class="chatOptions"><span class="thumbtack">...</span></div>
                    </div>
                </div>`,
                })
            chatElement.$(".chatOptions").on("click", e => {
                console.log("click!!")
                this.chatListRepository.pinChat(chat.username)
            })
            qs(".chatList").append(chatElement);
        }
    }
}

window.ChatController = ChatController
