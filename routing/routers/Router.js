const Eventable = require('sools-core/mixins/Eventable')
const mixer = require('sools-core/mixer')
const { chain } = require('sools-core/utils/array')

const functionToProcessable = (fn) => {
  return {
    async process(req, res, next) { await fn(req, res, next) }
  }
}

class Router extends mixer.extends([Eventable]) {

  constructor(values = {}) {
    super()
    Object.assign(this, {
      processables: [],
      ...values,
    })
  }

  route(url, ...middlewares) {
    const route = new Router({
      url,
      processables: middlewares.map(functionToProcessable),
    })
    this.processables.push(route)
  }

  use(...args) {
    let router
    if (args.length === 1 && args[0] instanceof Router) {
      router = args[0]
      this.processables.push(router)
    } else {
      this.processables.push(...args.map(functionToProcessable))
    }
  }

  async onMatch(req, res, next) {
    await chain(this.processables, (p, subNext) => {
      return p.process(req, res, subNext)
    }, next)
  }

  async process(req, res, next = () => { }) {
    let match
    if (this.url != undefined) {
      let urlToMatch = this.url
      if (urlToMatch === '') {
        urlToMatch = /^$/
      }
      match = req.url.match(urlToMatch)
      if (!match) {
        return next()
      }
    }

    const routerReq = {
      __proto__: req,
    }

    if (this.url) {
      const url = req.url.replace(match[0], '')
      Object.assign(routerReq, {
        match,
        url
      })
    }

    const routerRes = {
      __proto__: res,
      req,
    }

    await this.onMatch(routerReq, routerRes, next)
  }
}


module.exports = Router
  .define()