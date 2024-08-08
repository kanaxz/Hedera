const mixer = require('core/mixer')
const Propertiable = require('core/mixins/Propertiable')

module.exports = class It extends mixer.extends([Propertiable]) {
  constructor(values) {
    super()
    Object.assign(this, values)
  }

  destroy() {
    this.scope.destroy()
    this.element.remove()
  }
}
  .define()
  .properties({
    index: 'number',
  })
