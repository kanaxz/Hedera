const mixer = require('sools-core/mixer')
const Propertiable = require('sools-core/mixins/Propertiable')

module.exports = class Notification extends mixer.extends([Propertiable]) {
  constructor(values) {
    super()
    Object.assign(this, values)
  }
  close() {
    if (this.isClosed) {
      return
    }
    this.isClosed = true
    setTimeout(() => {
      const index = service.notifications.indexOf(this)
      if (index === -1) {
        return
      }
      service.notifications.splice(index, 1)
    }, 500);
  }
}
  .define()
  .properties({
    isClosed: 'any',
    message: 'any'
  })
