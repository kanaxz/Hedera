const { workers } = require('../global')
const { set } = require('sools-core/utils/path')
const { dashToCamel } = require('../utils')
const BindingFunction = require('./BindingFunction')
const BindingExpression = require('./BindingExpression')

const attributes = {
  class: (() => {
    const caches = []
    return (node, value, key) => {
      if (!value) {
        value = ''
      }
      const classes = value.split(' ').filter((o) => o && ['undefined', 'false', 'null'].indexOf(o) === -1)
      let cache = caches.find((c) => c.node === node && c.key === key)
      if (cache) {
        for (const cssClass of cache.classes) {
          node.classList.remove(cssClass)
        }
      } else {
        cache = {
          node,
          classes,
          key
        }
        caches.push(cache)
      }
      classes.forEach((c) => node.classList.add(c))
      cache.classes = classes
    }
  })(),
  innerHtml(node, value, key) {
    node.innerHTML = value
  }
}

const setAttr = (node, path, value, key) => {
  const attr = attributes[path]
  if (attr) {
    attr(node, value, key)
    return
  }
  set(node, path, value)
}

const PREFIX = ':'

const initBindings = (state) => {
  if (!state.bindings) {
    state.bindings = []
  }
}

const destroy = (state) => {
  if (!state.bindings) { return }
  state.bindings.forEach((b) => b.destroy())
  state.bindings = null
}

workers.push({
  async process(scope, state) {
    const { node } = state
    if (node.nodeType !== Node.TEXT_NODE) { return }
    if (node.textContent.indexOf('{{=') === -1) { return }
    initBindings(state)
    const functionContent = node.textContent.replace('{{=', '').replace('}}', '').trim()
    let child
    const parent = node.parentElement
    const binding = new BindingFunction(functionContent, { ...scope.variables }, async (value) => {
      if (child) {
        child.destroy()
        parent.innerHTML = ''
        child = null
      }
      if (!value) { return }
      if (typeof value === 'string') {
        parent.innerHTML = value
      } else {
        parent.appendChild(value)

      }

      child = scope.child()
      await child.renderContent(parent)
    })
    await binding.update()
    node.remove()
    state.bindings.push(binding)
  },
  destroy
}, {
  async process(scope, state) {
    const { node } = state
    if (node.nodeType !== Node.TEXT_NODE) { return }
    if (node.textContent.search('{{[^=]') === -1) { return }
    initBindings(state)
    const bindingExpression = new BindingExpression(node.textContent, { ...scope.variables }, (value) => {
      node.textContent = value
    })
    await bindingExpression.update()
    state.bindings.push(bindingExpression)
  },
  destroy
}, {
  async process(scope, state) {
    const { node } = state
    if (!node.attributes) { return }
    initBindings(state)
    const attributes = [...node.attributes]
      .filter((attr) => attr.name.startsWith(PREFIX))
    for (const attr of attributes) {
      const path = dashToCamel(attr.name.replace(PREFIX, ''))
      const bindingFunction = new BindingFunction(attr.nodeValue, { ...scope.variables }, (value) => {
        setAttr(node, path, value, attr.nodeValue)
      })
      await bindingFunction.update()
      state.bindings.push(bindingFunction)
      node.removeAttribute(attr.name)
    }
  },
  destroy
})

