/**
 * @author Alfa Saijers
 */

/**
 * get the time as a string in a readable format (h:m:s)
 * @param {boolean} utc - use utc time instead of local timezone
 * @param {number} offset - how many hours to add
 * @example
 * getTime(true, 4) // utc+4
 * getTime() // local
 * getTime(false, 3) // local+4
 */
export function getTime(utc = false, offset = 0) {
  let h, m, s
  let d = new Date()
  h = d[`get${utc ? 'UTC' : ''}Hours`]() + offset
  m = d[`get${utc ? 'UTC' : ''}Minutes`]()
  s = d[`get${utc ? 'UTC' : ''}Seconds`]()
  h = h < 10 ? '0' + h : h
  m = m < 10 ? '0' + m : m
  s = s < 10 ? '0' + s : s
  return `${h}:${m}:${s}`
}

/**
 * do a fetch request for json data
 */
export function fetchJSON(url, opts) {
  opts = opts || {}
  return new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(url, opts)
      let json = await response.json()
      resolve(json)
    } catch (e) {
      reject(e)
    }
  })
}

//alias
export { fetchJSON as fj }

// add a script file to the document head by uri
export function addScript(loc) {
  let script = document.createElement('script')
  script.src = loc
  document.head.append(script)
}

// add a style file to the document head by uri
export function addStyle(loc) {
  let style = document.createElement('link')
  style.rel = 'stylesheet'
  style.href = loc
  document.head.append(style)
}

// decode html symbols
// &sect;&amp; -> $&
export function decodeHtml(html) {
  let txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

// for loop with callback
// returns an array of callback return values
export function forRange(start, end, cb) {
  let vs = []
  for (let i = start; i < end; i++) {
    vs.push(cb.call(null, i))
  }
  return vs
}

// queryselector alias
export function qs(x, y) {
  y = y || document
  return y.querySelector(x)
}

// queryselectorall alias
export function qsa(x, y) {
  y = y || document
  return y.querySelectorAll(x)
}

// async wait for x seconds
export function sleep(x) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, x)
  })
}
/**
 * create element alias
 * @param {string} tagName - the html tag
 * @param {object} o - the attrs to add to the element
 * @example
 * ce('a', {href:'someurl'}) // <a href="someurl"></a>
 */
export function ce(tagName, o) {
  let elem = document.createElement(tagName)
  if (typeof o === 'string') {
    elem.innerHTML = o
  } else {
    Object.assign(elem, o)
  }
  return elem
}

/**
 * get the query string as an object
 * @returns {object} the key value pairs
 */
export function getQuery() {
  return location.search
    .replace('?', '')
    .split('&')
    .reduce((x, y) => {
      if (!y) return x
      y = y.split('=')
      x[y[0]] = y[1]
      return x
    }, {})
}

/**
 * update the current query string
 * @param {object} o - key value pairs
 * @example setQuery({q:'hello',k:'key'}) // 'q=hello&k=key'
 */
export function setQuery(o = {}) {
  let q = getQuery()
  Object.assign(q, o)
  let str = ''
  for (const k in q) {
    if (q.hasOwnProperty(k)) {
      str += `${k}=${q[k]}&`
    }
  }
  return str.replace(/&$/, '')
}

const byteUnits = ['B', 'K', 'M', 'G', 'T', 'P', 'E']
/**
 * convert bytes to a human readable format
 * @param {number} bytes - a number of bytes
 * @example
 * bytesToHR(4000) // 4K
 * bytesToHR(43400000) // 43M
 */
export function bytesToHR(bytes) {
  let i = 0
  while (bytes > 1024) {
    bytes = bytes / 1024
    i++
  }
  let a = Math.round(bytes || 0)
  if (a <= 0) {
    return undefined
  } else {
    return a + byteUnits[i]
  }
}

export class AdvancedObject extends Object {
  renameKeys(keysMap) {
    return Object.keys(this).reduce(
      (acc, key) => ({
        ...acc,
        ...{ [keysMap[key] || key]: this[key] },
      }),
      new AdvancedObject()
    )
  }
  filterByKey(regex = '') {
    regex = new RegExp(regex)
    let o = new AdvancedObject()
    for (const k of Object.keys(this)) {
      if (regex.test(k)) {
        o[k] = this[k]
      }
    }
    return o
  }
  only(keys = []) {
    let o = new AdvancedObject()
    for (const k of Object.keys(this)) {
      if (keys.includes(k)) {
        o[k] = this[k]
      }
    }
    return o
  }
}

// Set functions from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
export class AdvancedSet extends Set {
  difference(set) {
    let _difference = new Set(this)
    for (let elem of set) {
      _difference.delete(elem)
    }
    return _difference
  }
  symmetricDifference(set) {
    let _difference = new Set(this)
    for (let elem of set) {
      if (_difference.has(elem)) {
        _difference.delete(elem)
      } else {
        _difference.add(elem)
      }
    }
    return _difference
  }
  intersection(set) {
    let _intersection = new Set()
    for (let elem of set) {
      if (this.has(elem)) {
        _intersection.add(elem)
      }
    }
    return _intersection
  }
  union(set) {
    let _union = new Set(this)
    for (let elem of set) {
      _union.add(elem)
    }
    return _union
  }
  isSuperset(subset) {
    for (let elem of subset) {
      if (!this.has(elem)) {
        return false
      }
    }
    return true
  }
}

/**
 * a circular doubly linked list
 * @example
 * let ll = new LinkedList(['a','b','c'])
 * ll.next.value // 'b'
 * ll.tail.next.value // 'a'
 * ll.head.next.next.value // 'c'
 * ll.head.prev.value // 'c'
 */
export class LinkedList extends Array {
  _cur = 0

  set id(id) {
    this._cur = id
  }

  get id() {
    return this._cur
  }

  get value() {
    return this[this._cur]
  }

  set value(v) {
    this[this._cur] = v
  }

  get next() {
    this._cur += 1
    if (this._cur >= this.length) return this.head
    return this
  }

  get prev() {
    this._cur -= 1
    if (this._cur < 0) return this.tail
    return this
  }

  get head() {
    this._cur = 0
    return this
  }

  get tail() {
    this._cur = this.length > 0 ? this.length - 1 : 0
    return this
  }

  insert(...items) {
    this.splice(this._cur, 0, ...items)
    return this
  }
}

export class CustomEventTarget extends EventTarget {
  on(evt, fun, opts) {
    this.addEventListener(evt, fun, opts)
  }

  dispatch(evt, data, cancelable) {
    return this.dispatchEvent(
      new CustomEvent(evt, {
        detail: data,
        cancelable: cancelable || false,
      })
    )
  }
}
