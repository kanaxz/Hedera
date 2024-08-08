const Bindeable = require('sools-core/mixins/Bindeable')
const Propertiable = require('sools-core/mixins/Propertiable')
const Listening = require('./mixins/Listening')
const mixer = require('sools-core/mixer')
const Scope = require("./Scope")
const { base } = require('./setup')
const Destroyable = require('sools-core/mixins/Destroyable')
const BindingFunction = require('./set/BindingFunction')

const Base = mixer.mixin([Destroyable, Bindeable, Propertiable, Listening], (base) => {
  return class Base extends base {

    static variables(variables) {
      this._variables = {
        ...(this._variables || {}),
        ...variables
      }
      return this
    }

    constructor() {
      super()
      this.isInitialized = false
      this.bindings = []
    }

    getVariables() {
      return this.variables
    }

    async bind(name, value) {
      const variables = this.getVariables()
      const binding = new BindingFunction(value, variables, (value) => {
        this[name] = value
      })
      await binding.update()
      this.bindings.push(binding)
    }

    async initialize() {
      if (this.isInitialized) {
        throw new Error('Already initialized')
      }
      await this.onInit()
      this.isInitialized = true
    }

    async onInit() { }

    propertyChanged(...args) {
      if (!this.isInitialized) {
        return
      }

      return super.propertyChanged(...args)
    }

    destroy() {
      this.bindings.forEach((b) => b.destroy())
      super.destroy()
    }

  }

})
  .define()


module.exports = mixer.mixin([Base, ...base], (base) => class extends base { })
  .define()
  .properties({
    isInitialized: { type: 'any' }
  })
