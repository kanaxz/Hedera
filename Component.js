const mixer = require('sools-core/mixer')
const Base = require('./Base')
const { workers } = require('./global')
const Scope = require('./Scope')
class temp extends HTMLElement {

}

module.exports = class Component extends mixer.extends(temp, [Base]) {
  static define(definition) {
    if (definition?.name) {
      customElements.define(definition.name, this)
    }
    return super.define(definition)
  }

  constructor() {
    super()
    this.scope = null
  }

  attach(scope) {
    //this.upScope = scope
    this.scope = scope.child({
      source: this,
      variables: this.constructor._variables
    })
    return this
  }

  async initialize() {
    this.scope.type = this.constructor
    await super.initialize()
    this.initialContent = [...this.childNodes]
    await this.initializeTemplate()
    this.event('ready')
    Promise.resolve(this.onReady())
      .catch((err) => {
        console.error(err)
      })
  }

  onReady() { }

  async initializeTemplate() {
    const definition = this.constructor.definitions.find((d) => d.template)
    if (definition) {
      this.innerHTML = definition.template
      await this.scope.renderContent(this)
    }

    await this.scope.renderSlots(this.initialContent, this.scope.parent)
  }

  async awaitConnect() {
    if (this.isConnected) { return }

    return new Promise((resolve) => {
      const listener = this.on('connected', () => {
        resolve()
        listener.remove()
      })
    })
  }

  connectedCallback() {
    this.emit('connected')
  }

  event(name, arg) {
    const event = new CustomEvent(name, {
      bubbles: false,
    })
    Object.assign(event, arg)
    return this.dispatchEvent(event)
  }
}