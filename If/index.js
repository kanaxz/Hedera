const Virtual = require('../Virtual')
const BindingFunction = require('../set/BindingFunction')

module.exports = class If extends Virtual {
  async onInit() {
    await this.bind('condition', this.initialValue)
    this.on('propertyChanged:condition', this.b(this.onConditionChanged))
    this.parent = this.el.parentElement
    this.position = [...this.parent.childNodes].indexOf(this.el)
    await this.onConditionChanged()
  }

  async onConditionChanged() {
    const condition = await this.condition
    if (condition) {
      // already in the dom
      await this.scope.initialize(this.el)
      if (this.el.parentElement) { return }
      this.parent.insertBefore(this.el, this.parent.childNodes[this.position])
    } else {
      this.el.remove()
    }
  }

  async preventInitialize() {
    const condition = await this.condition
    return !condition
  }
}
  .define({
    name: 'if'
  })
  .properties({
    condition: 'any',
  })
