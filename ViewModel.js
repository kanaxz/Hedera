const Propertiable = require('sools-core/mixins/Propertiable')
const mixer = require('sools-core/mixer')

module.exports = class ViewModel extends mixer.extends([Propertiable]) {
  constructor(values = {}) {
    super()
    Object.assign(this, values)
  }
}