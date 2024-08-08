const { components: { Loader } } = require('../global')
const Virtual = require('../Virtual')

module.exports = class LoaderVirtual extends Virtual {
  async onInit() {
    this.on('propertyChanged', this.b(this.update))
    this.loader = new Loader()
    const [isLoading, size] = this.initialValue.split(/ size /)
    await this.bind('isLoading', isLoading)
    await this.bind('size', size)
    await this.scope.render(this.loader)
    this.update()
  }

  update() {
    this.loader.size = this.size
    if (this.isLoading) {
      this.el.appendChild(this.loader)
    } else if (this.loader.parentElement === this.el) {
      this.el.removeChild(this.loader)
    }
  }
}
  .define({
    name: 'loader'
  })
  .properties({
    isLoading: 'any',
    size: 'any',
  })
