const mixer = require('sools-core/mixer')
const Propertiable = require('sools-core/mixins/Propertiable')

class Context extends mixer.extends([Propertiable]) {
  constructor(values = {}) {
    super()
    Object.assign(this, values)
  }
}
const context = new Context()

module.exports = context