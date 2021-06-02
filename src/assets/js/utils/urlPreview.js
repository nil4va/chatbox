import { ce } from './alfa.js'

const CORS_PROXY = `https://mysterious-shore-04570.herokuapp.com/`
const rTitle = /title/,
  rDesc = /description/,
  rDomain = /(site_name|domain)/
const defUrl = v => ce('a', { href: v, textContent: v })
export default class UrlPreview {
  static cache = {}
  static mkPreview(url, { title, description }) {
    return ce('div', {
      className: 'UrlPreview',
      innerHTML: `
            <a href="${url}">${url.hostname} / ${title}</a>  
        <p>${description}</p>
    `,
    })
  }
  static async load(url) {
    try {
      url = new URL(url)
    } catch (e) {
      return defUrl(url)
    }
    let cached = UrlPreview.cache[url.toString()]
    if (cached) return UrlPreview.mkPreview(url, cached)
    // console.log(url)
    let head = await fetch(CORS_PROXY + url, { method: 'HEAD' })
    // if url content is not html return
    if (!/text\/html/.test(head.headers.get('content-type'))) return defUrl(url)
    let res = await fetch(CORS_PROXY + url)
    if (!res.ok) return defUrl(url)
    let data = await res.text()
    let parser = new DOMParser()
    let parsed = parser.parseFromString(data, 'text/html')
    let root = parsed.documentElement
    // console.log(root)
    let title, description, domain
    let metas = root.$$('meta').map(v => ({
      name: v.getAttribute('property') || v.name,
      value: v.content,
    }))
    metas.map(v => {
      switch (true) {
        case !!rTitle.test(v.name):
          title = v.value
          break
        case !!rDesc.test(v.name):
          description = v.value
          break
        case !!rDomain.test(v.name):
          domain = v.value
      }
    })
    // console.log(metas)
    data = { title, description, domain }
    UrlPreview.cache[url.toString()] = data
    return UrlPreview.mkPreview(url, data)
  }
}
