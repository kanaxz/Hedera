const Destroyable = require('sools-core/mixins/Destroyable')
const Virtual = require('../Virtual')

module.exports = class Exit extends Virtual {
  async onInit() {
    const [callback, when] = this.initialValue.split(/ when /)
    await this.bind('callback', `()=>${callback}`)
    if(when){
      await this.bind('when', when)
    }
    
    this.listen(window, 'click', this.onWindowClicked, true)
    this.listen(window, 'keydown', this.onWindowKeyDown, true)
    if (this.when === undefined) {
      this.when = true
    }
  }

  onWindowKeyDown(e) {
    if (e.key === "Escape") {
      this.trigger()
    }
  }

  onWindowClicked(e) {
    if (!this.el.contains(e.target)) {
      this.trigger()
    }
  }

  trigger() {
    if (this.destroyed) { return }
    if (!this.when) { return }
    this.callback()
  }
}
  .define({
    name: 'exit'
  })
  .properties({
    callback: 'any',
  })
