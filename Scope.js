const mixer = require('sools-core/mixer')
const { workers } = require('./global')
const Destroyable = require('sools-core/mixins/Destroyable')
const Eventable = require('sools-core/mixins/Eventable')
const Vars = require('./Vars')
const { moveAttributes } = require('./utils')
const BindingFunction = require('./set/BindingFunction')
const { getElementFromTemplate } = require('./utils/template')

workers.push({
  process(scope, { node }) {
    if (node.nodeType !== Node.ELEMENT_NODE) { return }
    if (!node.hasAttribute('slot')) { return }
    const slotName = node.getAttribute('slot') || 'main'
    node.removeAttribute('slot')

    scope.slots[slotName] = {
      node,
      children: [...node.childNodes]
    }
  }
})


const processors = [
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
    await childScope.renderSlots(initialContent)
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

const findFirstNode = (nodes) => {
  for (node of nodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
      continue
    }
    return node
  }
  return null
}

module.exports = class Scope extends mixer.extends([Destroyable, Eventable]) {
  constructor({ source, parent, variables }) {
    super()
    this.parent = parent
    this.states = []
    this.variables = {
      ...(this.parent?.variables || {}),
      ...(variables || {}),
      scope: this,
    }
    if (source) {
      this.variables.this = source
    }
    this.level = (parent?.level || 0) + 1
    this.variables.$ = new Vars()
    this.slots = {}
    this.childs = []
  }

  child(options = {}) {
    const child = new Scope({
      parent: this,
      ...options
    })
    this.childs.push(child)
    return child
  }

  async renderSlots(nodes, renderScope) {
    if (this.destroyed) { return }
    if (!nodes.length) { return }
    if (!renderScope) {
      renderScope = this
    }
    const renderSlot = async (slotName, nodes) => {
      const slot = this.slots[slotName]
      if (!slot) {
        console.log(this)
        throw new Error(`Slot ${slotName} not found`)
      }
      this.currentSlot = slot

      const { node } = slot
      node.replaceChildren(...nodes)
      for (const node of nodes) {
        await renderScope.render(node)
      }

    }
    const firstNode = findFirstNode(nodes)
    if (!firstNode) {
      return
    }
    if (firstNode.nodeName !== 'SLOT') {
      await renderSlot('main', nodes)
    } else {
      const slots = [...nodes].filter((n) => n.nodeType === Node.ELEMENT_NODE)
      for (const slot of slots) {
        const slotName = slot.getAttribute('name') || 'main'
        slot.removeAttribute('name')
        await renderSlot(slotName, [...slot.childNodes])
      }
    }

  }

  async process(node) {
    if (this.destroyed) { return }
    const state = { node, scope: this }
    if (!node.hederaStates) {
      node.hederaStates = []
    }
    node.hederaStates.push(state)
    this.states.push(state)
    this.variables.node = node
    for (const worker of workers) {
      await worker.process(this, state)
    }
    await this.initializeVirtuals(state)
    this.variables.node = null
    return state
  }

  async renderTemplate(template, variables) {
    const node = getElementFromTemplate(template)
    return this.render(node, variables)
  }

  getState(node) {
    const state = this.states.find((state) => state.node === node)
    if (state) { return state }

    return this.parent.getState(node)
  }

  async renderContent(node) {
    for (const n of node.childNodes) {
      await this.render(n)
    }
  }

  async render(node, variables = {}) {
    if (this.destroyed) { return }
    Object.assign(this.variables, variables)
    for (const processor of processors) {
      if (await processor(this, node)) {
        return null
      }
    }
    if (node.rendered) { return node }
    node.rendered = true
    if (node.attach) {
      node = await node.attach(this)
    }
    if (!node) { return null }

    const state = await this.process(node)
    await this.initialize(state)
    return node
  }

  async initialize(state) {
    if (this.destroyed) { return }
    if (!state.node) {
      state = this.states.find(({ node }) => node === state)
    }
    const { node } = state
    if (node.isInitialized) {
      //console.warn('Already initialized', node)
      return
    }
    if (state.virtuals) {
      for (const virtual of state.virtuals) {
        if (await virtual.preventInitialize()) {
          return
        }
      }
    }
    if (node.initialize) {
      await node.initialize()
    } else {
      await this.renderContent(node)
      node.isInitialized = true
    }

  }

  async readyVirtuals(state) {
    if (state.virtuals) {
      for (const virtual of state.virtuals) {
        //await virtual.onReady()

        Promise.resolve(virtual.onReady())
          .catch((err) => {
            console.error(err)
          })
        /**/
      }
    }
  }

  async initializeVirtuals(state) {
    if (this.destroyed) { return }
    if (!state.virtuals) { return }

    for (const virtual of state.virtuals) {
      if (!virtual.isInitialized) {
        await virtual.initialize()
      }
    }
  }

  release(node) {
    const index = this.states.findIndex((state) => state.node === node)
    if (index === -1) {
      throw new Error()
    }
    const state = this.states[index]
    workers.forEach((w) => w.destroy && w.destroy(state))
    this.states.splice(index, 1)
  }

  destroy() {
    super.destroy()
    while (this.childs.length) {
      this.childs[0].destroy()
    }
    while (this.states.length) {
      this.release(this.states[0].node)
    }
    if (this.parent) {
      this.parent.childs.splice(this.parent.childs.indexOf(this), 1)
    }

    this.parent = null
    this.childs = null
    this.nodes = null
  }
}
