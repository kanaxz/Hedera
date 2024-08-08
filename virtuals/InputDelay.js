const Virtual = require('../Virtual')

module.exports = class InputDelay extends Virtual {
  async onInit(){
    this.timeout = null
    await this.bind('callback', `()=>${this.initialValue}`)
    this.listen(this.el, 'input', this.onChange)
  }

  onChange() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.callback()
    }, 500)
  }
}
  .define({
    name: 'inputDelay'
  })
  .properties({
    callback: 'any',
  })
