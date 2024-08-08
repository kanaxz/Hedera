const Virtual = require('../Virtual')
const It = require('./It')
const { getElementFromTemplate, getElementFromObject } = require('../utils/template')
const handlers = require('./handlers')

module.exports = class For extends Virtual {
  async onInit() {
    this.iterations = null
    this.on('propertyChanged:source', this.b(this.onSourceChanged))
    const value = this.initialValue
    const [name, remaining] = value.split(/ of /)
    const [source, template] = remaining.split(/ with /)
    await this.bind('name', `'${name}'`)
    await this.bind('source', source)
    if (template) {
      await this.bind('template', template)
    } else {
      this.template = [...this.el.childNodes].find((child) => child.nodeType === Node.ELEMENT_NODE)
      this.el.innerHTML = ''
    }
    await this.onSourceChanged()
  }

  iteration(object, index) {
    const scope = this.scope.child()
    scope.variables[this.name] = object
    scope.variables.index = index
    let element
    if (typeof this.template === 'function') {
      const result = this.template(object, scope)
      if (result instanceof HTMLTemplateElement) {
        element = getElementFromTemplate(result)
      } else {
        element = result
      }
    } else {
      element = getElementFromObject(this.template)
    }

    const it = new It({ index, object, element, scope })


    this.iterations.push(it)
    return it
  }

  reset() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }
    if (this.iterations) {
      this.iterations.forEach((it) => {
        it.destroy()
      })
    }
    this.iterations = []
  }

  async onSourceChanged() {
    this.reset()
    if (!this.source) { return }

    const handler = handlers.find((handler) => handler.handle(this.source))
    if (handler) {
      this.handler = new handler(this)
    } else {
      this.handler = null
    }

    let i = 0
    setTimeout(async () => {
      const source = this.source
      while (i < source.length && source === this.source) {
        await new Promise(async (resolve) => {
          setTimeout(async () => {
            const it = this.iteration(this.source[i], i)
            this.el.appendChild(it.element)
            it.element = await it.scope.render(it.element)
            i++
            resolve()
          }, 0)
        })
      }
    })

  }

  preventInitialize() {
    return true
  }

  /**
   * no need to destroy iterations as their scopes will be destroyed as the current local scope will be destroyed
   */
  destroy() {
    if (this.handler) {
      this.handler.destroy()
    }
    super.destroy()
  }
}
  .define({
    name: 'for'
  })
  .properties({
    source: 'any',
    name: 'any',
  })
