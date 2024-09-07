const { moveAttributes } = require('../utils')
const BindingFunction = require('../set/BindingFunction')

module.exports = [
  async (scope, node) => {
    if (node.nodeName !== 'SELF') {
      return false
    }

    // move self content
    const parent = node.parentElement
    node.remove()
    while (node.childNodes.length) {
      parent.appendChild(node.childNodes[0])
    }

    // move attributes
    const component = scope.variables.this
    moveAttributes(node, component)
    const state = await scope.process(component)
    await scope.readyVirtuals(state)

    // process
    await scope.renderContent(parent)
    return true
  },
  async (scope, node) => {
    if (node.nodeName !== 'SUPER') {
      return false
    }
    // process super attributes
    const component = scope.variables.this
    moveAttributes(node, component)
    await scope.process(component)

    // process super template
    const nextDefinition = scope.type.definitions.filter((d) => d.template)[1]
    if (!nextDefinition) {
      throw new Error(`Cannot invoke 'super' as there is no parent with a template`)
    }
    const initialContent = [...node.childNodes]

    // create a temp div and set inner-html, and use child nodes to replace super node
    const container = document.createElement('div')
    container.innerHTML = nextDefinition.template
    const superNodes = [...container.childNodes]
    node.replaceWith(...superNodes)

    // render new child nodes
    const childScope = scope.child()
    childScope.type = nextDefinition.owner
    childScope.slots = {}
    scope.slots.__proto__ = childScope.slots
    for (const node of superNodes) {
      await childScope.render(node)
    }

    // process super content
    const slots = await childScope.renderInitialContent(initialContent, childScope)
    await childScope.renderSlots(slots, childScope)
    return true
  },
  async (scope, node) => {
    if (node.nodeName !== 'SUPER-SLOT') {
      return false
    }

    node.replaceWith(...scope.currentSlot.children)
    return true
  },
  async (scope, node) => {
    if (node.nodeName !== 'VARS') {
      return false
    }
    const vars = scope.variables.$
    for (const attribute of node.attributes) {
      const propertyName = attribute.name.replace(':', '')
      if (!vars.hasOwnProperty(propertyName)) {
        vars.defineProperty({
          name: propertyName
        })
      }


      const bindingFunction = new BindingFunction(attribute.value, scope.variables, (value) => {
        vars[propertyName] = value
      })

      await bindingFunction.update()

      vars.bindingFunctions.push(bindingFunction)
    }
    node.remove()
    return true
  },
]