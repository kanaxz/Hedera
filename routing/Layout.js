const Component = require('../Component')
const LocalStorageable = require('../mixins/LocalStorageable')
const mixer = require('sools-core/mixer')

module.exports = class Layout extends mixer.extends(Component, [LocalStorageable]) {



  onReady() {
    if (!this.container)
      throw new Error("Layout '" + this.constructor.name + "' must implement a container");
  }

  async setContent(content) {
    const oldContent = this.content

    this.content = content
    this.contentReady = false
    await this.scope.render(this.content)
    if (oldContent) {
      this.scope.release(oldContent)
      oldContent.remove()
    }
    this.container.appendChild(this.content)
    this.contentReady = true

  }
}
  .define()
  .properties({
    contentReady: 'any',
  })
