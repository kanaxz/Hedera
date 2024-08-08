const Component = require('../../Component')
const template = require('./template.html')
require('./style.scss')

const MAX = 1000

const staticKeys = {
  ctrl: (e) => e.ctrlKey,
  alt: (e) => e.altKey
}

const getKeys = (keysString) => {
  const keysArray = keysString.split('+')
  const keys = {}
  for (let key of keysArray) {
    key = key.toUpperCase()
    const existing = keys[key]
    keys[key] = existing ? existing + 1 : 1
  }
  return keys
}

const matchKeys = (keys1, keys2) => {
  const entries = Object.entries(keys1)
  for (const [k, v] of entries) {
    if (v !== keys2[k]) {
      return false
    }
  }
  return true
}

const keysHtml = {
  ARROWDOWN: '<i class="fa-solid fa-arrow-down"></i>',
  ARROWUP: '<i class="fa-solid fa-arrow-up"></i>'
}

module.exports = class ShortCut extends Component {
  constructor() {
    super()
    this.target = this.parentElement
    this.on('propertyChanged:key', this.b(this.updateKeys))

  }

  onInit() {
    this.updateKeys()
    if (!this.callback) { return }
    this.target.addEventListener('keydown', this.b(this.onKeyDown))
  }

  updateKeys() {
    this.keys = getKeys(this.key)
    this.keyHtml = Object.keys(this.keys).map((key) => {
      let keyHtml = keysHtml[key]
      if (keyHtml) { return keyHtml }
      return key
    }).join('+')
  }

  start() {
    this.reset()
    this.startDate = new Date()
  }

  stackKey(key) {
    key = key.toUpperCase()
    if (!this.keys[key]) { return }
    const existing = this.keysPressed[key]
    this.keysPressed[key] = Math.min(this.keys[key], existing ? existing + 1 : 1)
  }

  reset() {
    this.keysPressed = {}
    this.startDate = null
  }

  trigger() {
    this.reset()
    if (this.callback) {
      setTimeout(() => this.callback())
    }
  }

  stack(e) {
    const pressedStaticKeys = Object.entries(staticKeys).filter(([k, c]) => c(e))
    pressedStaticKeys.forEach(([k]) => this.stackKey(k))
    this.stackKey(e.key)
    if (matchKeys(this.keys, this.keysPressed)) {
      this.trigger()
    }
  }


  onKeyDown(e) {
    if (this.startDate) {
      if (new Date() - this.startDate > MAX) {
        this.start()
      }
    } else {
      this.start()
    }

    this.stack(e)
  }
}
  .define({
    name: 'short-cut',
    template,
  })
  .properties({
    callback: 'any',
    keyHtml: 'any',
    key: 'any',
  })
