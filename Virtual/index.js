const { virtuals } = require('./worker')
const mixer = require('sools-core/mixer')
const Base = require('../Base')

module.exports = class Virtual extends mixer.extends([Base]) {

  static define(definition) {
    if (definition.name) {
      virtuals.push(this)
    }
    return super.define(definition)
  }

  constructor(scope, variables, el, initialValue) {
    super()
    this.scope = scope
    this.variables = variables
    this.el = el
    this.initialValue = initialValue
  }

  getVariables() {
    return this.variables
  }

  preventInitialize() {
    return false
  }

  onReady() { }
}
