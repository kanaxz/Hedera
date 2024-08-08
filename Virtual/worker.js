const { workers } = require('../global')
const { dashToCamel } = require('../utils')

const virtuals = []

workers.push({
  process(scope, state) {
    const { node } = state
    if (!node.attributes) { return }

    state.virtuals = [];
    ([...node.attributes])
      .filter((attr) => attr.name.startsWith(':v-'))
      .forEach((attr) => {
        const [virtualName, ...args] = dashToCamel(attr.name.replace(':v-', '')).split('.')
        const virtualClass = virtuals.find((v) => v.definition.name === virtualName)
        if (!virtualClass) { return }
        const params = args.reduce((acc, arg) => {
          acc[arg] = true
          return acc
        }, {})
        const virtual = new virtualClass(scope, {...scope.variables}, node, attr.value, params)
        state.virtuals.push(virtual)
        node.removeAttribute(attr.name)
      })
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