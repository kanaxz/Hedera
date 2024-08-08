const mixer = require("../mixer")

module.exports = mixer.mixin((baseClass) => {
  return class Initializeable extends baseClass {
    constructor(...args){
      super(...args)
      this.isInitialized = false
    }
    initialize() {
      this.isInitialized = true
    }
  }
})