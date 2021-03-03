import { fetchJSON } from './alfa.js'

export default class WebSocketManager {
  static async connect() {
    let res = await fetchJSON(`//${location.hostname}:3000/gateway`)
    if (res.gateway) {
      return new WebSocket(res.gateway)
    }
    return false
  }
}
