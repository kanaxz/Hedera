const Propertiable = require("sools-core/mixins/Propertiable")
const mixer = require('sools-core/mixer')

module.exports = mixer.mixin([Propertiable], (base) => {
  return class LocalStorageable extends base {
    static localStorage(options) {
      this.localStorageOptions = options
      return this
    }

    constructor(...args) {
      super(...args)
      const options = this.constructor.localStorageOptions
      if (!options) { return }

      let initialValues = localStorage.getItem(options.name)
      if (initialValues) {
        initialValues = JSON.parse(initialValues)
        Object.assign(this, initialValues)
      }

      this.on('propertyChanged', () => {
        const values = this.values
        const valuesToSave = Object.entries(values)
          .filter(([name]) => options.properties.indexOf(name) !== -1)
          .reduce((acc, [name, value]) => {
            acc[name] = value
            return acc
          }, {})

        localStorage.setItem(options.name, JSON.stringify(valuesToSave))
      })
    }
  }
})