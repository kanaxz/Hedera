const Virtual = require('../Virtual')
const { navigator } = require('../global')

module.exports = class Link extends Virtual {
  async onInit() {
    await this.bind('href', this.initialValue)

    this.el.addEventListener('click', async (event) => {
      event.preventDefault()
      if (this.href) {
        this.el.classList.add('loading')
        const start = new Date()
        await navigator.navigate(this.href)
        this.el.classList.remove('loading')
        console.log(new Date() - start)
      }
    })

    this.on('propertyChanged:href', () => {
      this.updateHref()
    })
    navigator.on('change', () => {
      this.updateActive()
    })

    this.updateActive()
    this.updateHref()
  }

  updateHref() {
    this.el.href = this.href || ''
  }

  updateActive() {
    const isActive = this.href === navigator.currentUrl
    this.el.classList[isActive ? 'add' : 'remove']('active')
  }
}
  .define({
    name: 'link'
  })
  .properties({
    href: 'any',
  })
