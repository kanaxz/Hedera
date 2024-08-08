const Router = require('./Router')

module.exports = class LayoutRouter extends Router {
  async onMatch(req, res, next) {
    res.layouts = [...res.layouts, this.layout]
    await super.onMatch(req, res, next)
  }
}
  .define()