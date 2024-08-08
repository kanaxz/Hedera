const mixer = require('core/mixer')

module.exports = mixer.mixin((base) => {
  return class Interactable extends base {
    constructor(...args) {
      super(...args)
      this.tabIndex = 0
      this.listen(this, 'keydown', this.onKeyDown)
    }

    onKeyDown(e) {
      if (e.key !== 'Enter') { return }
      this.event('interact')
    }
  }
})