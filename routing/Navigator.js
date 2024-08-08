const Router = require('./routers/Router')

module.exports = class Navigator extends Router {
  constructor() {
    super()
    this.use((req, res, next) => {
      res.navigate = (...args) => this.navigate(...args)
      return next()
    })
  }

  async start() {
    window.addEventListener('popstate', async () => {
      await this.processCurrent()
    })

    await this.processCurrent()
  }

  async processCurrent() {
    this.currentUrl = window.location.pathname
    const req = {
      url: this.currentUrl,
    }

    const res = {}
    await this.process(req, res)
    await this.emit('change')
  }

  async navigate(url, replaceState) {
    history[replaceState ? "replaceState" : "pushState"]({}, '', url)
    await this.processCurrent()
  }
}
