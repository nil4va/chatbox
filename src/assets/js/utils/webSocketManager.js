import { CustomEventTarget2, fetchJSON } from './alfa.js'
/**
 * websocket abstraction
 * @author Alfa Saijers
 */

export const TYPES = {
  MESSAGE: 'message',
  ERROR: 'error',
  SUCCESS: 'success',
  IDENTIFY: 'identify',
  TYPING: 'typing',
}

export default class SimpleWebSocket extends CustomEventTarget2 {
  constructor() {
    super()
    this._ws = null
    this._connect()
  }
  send(type, data) {
    console.log('WSSND', data)
    this._ws.send(JSON.stringify({ type, data }))
  }
  async _connect() {
    let res = await fetchJSON(`//${location.hostname}:3000/gateway`)
    if (res.gateway) {
      this._ws = new WebSocket(res.gateway)
      this._ws.onopen = e => {
        this._ws.onmessage = e => {
          let data = JSON.parse(e.data)
          console.log('WSRCV', data)
          if (
            data.type === TYPES.SUCCESS &&
            data.data.type === TYPES.IDENTIFY
          ) {
            this.identifySuccess = 1
          }
          if (this.identifySuccess) {
            this.dispatch('message', data)
          }
        }
        this.send(TYPES.IDENTIFY, { name: sessionManager.get('username') })
      }
    }
    return false
  }
}

window.SimpleWebSocket = SimpleWebSocket
