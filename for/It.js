const mixer = require('sools-core/mixer')
const Propertiable = require('sools-core/mixins/Propertiable')

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
