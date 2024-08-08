const Virtual = require('../Virtual')
const utils = require('./utils')

module.exports = class TabLoop extends Virtual {
  constructor(el) {
    super(el)
    let current = null
    window.addEventListener('focusin', (e) => {
      const target = document.activeElement
      if (this.el.contains(target)) {
        current = target
      } else if (current) {
        utils.focusFirst(this.el)
      }
    })
  }
}
  .define({
    name: 'tabLoop'
  })

