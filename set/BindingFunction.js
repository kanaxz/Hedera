const Event = require('sools-core/types/Event')

const { createFunction } = require('../utils')

const processFunctionString = (string) => {
  let sanitized = string
  const paths = string.match(/((?:[\w|$|?]+\.@?[\w|$|.|@|?]+))/g) || []
  //.filter((p) => p.indexOf('@') !== -1)
  paths
    .forEach((p) => {
      sanitized = sanitized.replace(p, p.replace(/@/g, ''))
    })

  return {
    sanitized,
    paths,
  }
}


const onBindingGetProperty = new Event()
const onBindingDestroyed = new Event()


module.exports = class BindingFunction {

  static onBindingGetProperty = onBindingGetProperty
  static onBindingDestroyed = onBindingDestroyed
  constructor(functionString, variables, callback) {
    this.functionString = functionString
    this.variables = variables
    this.callback = callback
    this.listeners = []
    this.holdables = []
    const { sanitized, paths } = processFunctionString(functionString)
    this.paths = paths
    const vars = {
      ...variables
    }
    delete vars.this
    this.sanitizedFunctionString = sanitized
    this.function = createFunction('return ' + sanitized, vars)
  }

  async getValue() {
    const thisArg = this.variables.this
    const value = await this.function.call(thisArg)
    return value
  }

  async update(trigger = true) {
    this.destroy()
    this.listeners = []
    this.paths.forEach((path) => {
      const segments = path.split('.')
      let value = this.variables
      segments.forEach((segment) => {
        if (!value) { return }

        const propertyName = segment.replace(/[@?]+/g, '')
        if (segment.startsWith('@')) {
          if (!value.on) {
            console.log(path, { value })
            throw new Error()
          }
          const listener = value.on(`propertyChanged:${propertyName}`, async () => {
            await this.update()
          })
          this.listeners.push(listener)
        }
        value = value[propertyName]
        if (value) {
          onBindingGetProperty.trigger(this, value)
        }
      })
    })
    if (trigger) {
      const value = await this.getValue()
      await this.callback(value)
      return value
    }
  }

  destroy() {
    this.listeners.forEach((l) => l.remove())
    onBindingDestroyed.trigger(this)
  }
}