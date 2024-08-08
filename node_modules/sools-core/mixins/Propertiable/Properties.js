const Tree = require('../../types/Tree')
const Mixin = require('../../Mixin')
module.exports = class Properties extends Tree {
  constructor(owner) {
    super()
    this.owner = owner
    owner.definition.parents
      .filter((p) => p.properties)
      .forEach((parent) => {
        this.push(parent.properties)
      })
  }

  call(...args) {
    super.call(...args)
    return this.owner
  }

  shouldIterateTree(it, tree) {
    const shouldIterateTree = !(this.owner.prototype instanceof Mixin) || !it.from || !(tree instanceof Properties)
    return shouldIterateTree
  }

  push(...args) {
    args.forEach((arg) => {
      if (arg instanceof Properties) {
        super.push(arg)
        return
      }
      if (typeof arg === 'object') {
        Object.entries(arg)
          .forEach(([name, property]) => {
            if (typeof property !== 'object') {
              property = {
                type: property,
              }
            }
            property.name = name
            super.push(property)
            this.owner.sanitizeProperty(property)
          })
        return
      }
      throw new Error(`Property type not recognized`)
    })
  }
}