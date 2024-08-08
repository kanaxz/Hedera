const ViewModel = require('./ViewModel')

module.exports = class Vars extends ViewModel {
  constructor() {
    super()
    this.bindingFunctions = []
  }
  destroy() {
    this.bindingFunctions.forEach((b) => b.destroy())
    super.destroy()
  }
}
  .define()