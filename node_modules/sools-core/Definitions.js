const Tree = require('./types/Tree')

module.exports = class Definitions extends Tree {
  constructor(owner) {
    super()
    this.push(owner.definition)
    this.owner = owner
    owner.definition.parents
      .filter((o) => o.definitions)
      .forEach((parent) => {
        this.push(parent.definitions)
      })
  }
}