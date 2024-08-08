const Propertiable = require('core/mixins/Propertiable')
const mixer = require('core/mixer')

module.exports = class ViewModel extends mixer.extends([Propertiable]) {
  constructor(values = {}) {
    super()
    Object.assign(this, values)
  }
}