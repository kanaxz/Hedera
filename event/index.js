const { workers } = require('../global')
const { createFunction, dashToCamel } = require('../utils')

const prefix = ':on-'

const suffixes = {
  stop: {
    onEvent(event) {
      event.stopPropagation()
    }
  },
  prevent: {
    onEvent(event) {
      console.log('prevent', event)
      event.preventDefault()
    }
  },
  'no-capture': {
    onListen(options) {
      options.capture = false
    }
  },
  capture: {
    onListen(options) {
      options.capture = true
    }
  }
}

workers.push({
  process(scope, state) {
    const { node } = state
    if (!node.attributes) { return }
    state.listeners = [];
    ([...node.attributes])
      .filter((attr) => attr.name.startsWith(prefix))
      .forEach((attr) => {
        const options = {}
        let [eventName, ...suffixeNames] = attr.name.replace(prefix, '').split('.')
        suffixeNames.forEach((s) => {
          const suffix = suffixes[s]
          suffix.onListen && suffix.onListen(options)
        })
        eventName = dashToCamel(eventName)
        const vars = { ...scope.variables }
        delete vars.this
        const callback = (event) => {
          suffixeNames.forEach((s) => {
            const suffix = suffixes[s]
            suffix.onEvent && suffix.onEvent(event)
          })
          suffixeNames.forEach((s) => {
            const suffix = suffixes[s]
            suffix.onEvent && suffix.onEvent(event)
          })
          const eventVars = { ...vars, event }

          const fn = createFunction(attr.nodeValue, eventVars)
          fn.call(scope.variables.this)
        }
        node.addEventListener(eventName, callback, options)
        node.removeAttribute(attr.name)
        state.listeners.push({ eventName, callback })
      })
  },
  destroy(state) {
    if (!state.listeners) { return }
    state.listeners.forEach(({ eventName, callback }) => {
      state.node.removeEventListener(eventName, callback)
    })
  }
})
