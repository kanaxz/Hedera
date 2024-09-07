const { workers } = require('../global')
const { dashToCamel } = require('../utils')

const virtuals = []

const prefixes = ['@', ':v-on']

const getPrefix = (attrName) => {
  return prefixes.find((p) => attrName.startsWith(p))
}

workers.push({
  async process(scope, state) {
    const { node } = state
    if (!node.attributes) { return }

    state.virtuals = [];
    const attrs = [...node.attributes]
    for (const attr of attrs) {
      const prefix = getPrefix(attr.name)
      if (!prefix) { continue }

      const [virtualName, propertyName] = dashToCamel(attr.name.replace(prefix, '')).split('.')
      const virtualClass = virtuals.find((v) => v.definition.name === virtualName)
      if (!virtualClass) { continue }

      if (propertyName) {
        const virtual = state.virtuals.find((v) => v instanceof virtualClass)
        if (!virtual) {
          throw new Error(`Virtual${virtualName} not found`)
        }

        await virtual.bind(propertyName, attr.value)
      } else {
        const virtual = new virtualClass(scope, { ...scope.variables }, node, attr.value)
        state.virtuals.push(virtual)
      }

      node.removeAttribute(attr.name)
    }
  },
  destroy(state) {
    if (!state.virtuals) { return }
    state.virtuals.forEach((virtual) => {
      virtual.destroy()
    })
    state.virtuals = null
  }
})

module.exports = {
  virtuals,
}