const Propertiable = require('sools-core/mixins/Propertiable')
const mixer = require('sools-core/mixer')
const Bindeable = require('sools-core/mixins/Bindeable')

module.exports = class Service extends mixer.extends([Propertiable, Bindeable]) {
  constructor(...args) {
    super(...args)
    if (this.instance) { throw new Error('Already instanciated') }
    this.constructor.instance = this
  }
}
  .define()