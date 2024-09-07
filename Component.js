const mixer = require('sools-core/mixer')
const Base = require('./Base')
class temp extends HTMLElement {

}

module.exports = class Component extends mixer.extends(temp, [Base]) {
  static define(definition) {
    if (definition?.name) {
      customElements.define(definition.name, this)
    }
    return super.define(definition)
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
    const slots = await this.scope.renderInitialContent(this.childNodes, this.scope.parent)
    await super.initialize()
    await this.initializeTemplate()
    await this.scope.renderSlots(slots, this.scope.parent)
    this.event('ready')
    Promise.resolve(this.onReady())
      .catch((err) => {
        console.error(err)
      })
  }
  onReady() { }

  async initializeTemplate() {
    const template = this.constructor.definitions.find((d) => d.template)?.template
    this.innerHTML = template || ''
    await this.scope.renderContent(this)
  }

  event(name, arg) {
    const event = new CustomEvent(name, {
      bubbles: false,
    })
    Object.assign(event, arg)
    return this.dispatchEvent(event)
  }
}
  .define()