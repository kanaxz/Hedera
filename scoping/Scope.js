const mixer = require('sools-core/mixer')
const { workers } = require('../global')
const Destroyable = require('sools-core/mixins/Destroyable')
const Eventable = require('sools-core/mixins/Eventable')
const Vars = require('../Vars')
const { getElementFromTemplate } = require('../utils/template')
const processors = require('./processors')
const Array = require('sools-modeling/types/Array')
const { dashToCamel } = require('../utils')

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
    if(!this.childs){
      console.log(this)
    }
    this.childs.push(child)
    return child
  }

  async renderInitialContent(nodes, renderScope) {
    nodes = [...nodes]
      .filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim() !== '')

    const hasSpecialNodes = nodes
      .some((n) => n.nodeName.startsWith('SET.') || n.nodeName === 'SLOT')

    if (!hasSpecialNodes) {
      if (nodes.length) {
        return [{ name: 'main', nodes }]
      }
      return []
    }

    let slots = []
    nodes = [...nodes].filter((n) => n.nodeType === Node.ELEMENT_NODE)
    for (const node of nodes) {
      if (node.nodeName.startsWith('SET.')) {
        const [, propertyName] = dashToCamel(node.nodeName.toLowerCase()).split('.')
        await renderScope.renderContent(node)
        this.variables.this[propertyName] = new Array(...node.children)
      } else if (node.nodeName === 'SLOT') {
        const name = node.getAttribute('name') || 'main'
        slots.push({ name, nodes: [...node.childNodes] })
      }
    }
    return slots
  }

  async renderSlots(slots, renderScope) {
    for (const { name, nodes } of slots) {
      const slot = this.slots[name]
      if (!slot) {
        console.log(this)
        throw new Error(`Slot ${name} not found`)
      }
      this.currentSlot = slot

      const { node } = slot
      node.replaceChildren(...nodes)
      for (const node of nodes) {
        await renderScope.render(node)
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

  /*
  getState(node) {
    const state = this.states.find((state) => state.node === node)
    if (state) { return state }

    return this.parent.getState(node)
  }
  */

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
      console.warn('Already initialized', node)
      return
    }
    if (state.virtuals) {
      for (const virtual of state.virtuals) {
        Promise.resolve(virtual.onReady())
          .catch((err) => {
            console.error(err)
          })
        if (await virtual.preventInitialize()) {
          //console.warn('prevented', node, virtual)
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
    if (!state.virtuals) { return }

    for (const virtual of state.virtuals) {
      //await virtual.onReady()

      Promise.resolve(virtual.onReady())
        .catch((err) => {
          console.error(err)
        })
      /**/
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
