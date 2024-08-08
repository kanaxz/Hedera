const mixer = require('./mixer')
const Definitions = require('./Definitions')

module.exports = mixer.mixin((base) => {
  return class Base extends base {

    static hasMixin(mixin) {
      return this.allDependencies.some((d) => d === (mixin.mixin || mixin))
    }


    static define(definition = {}) {
      if (this.definition?.owner === this) {
        throw new Error(`Class ${this.name} already defined`)
      }

      if (!this.dependenciesOwner) {
        this.dependenciesOwner = this
      } else {
        this.dependencies = []
      }
      const parent = this.definition?.owner
      const parents = [parent, ...(this.dependencies || [])]
        .filter((p) => p?.definition)
      parents.forEach((parent) => {
        parent.definition.childs.push(this)
      })
      this.definition = {
        ...definition,
        childs: [],
        parent,
        parents,
        owner: this,
      }

      this.definitions = new Definitions(this)

      return this
    }

    static set(values) {
      Object.assign(this, values)
      return this
    }

    static findChild(check) {
      if (check(this)) {
        return this
      }
      for (const child of this.definition.childs) {
        const subChild = child.findChild(check)
        if (subChild) {
          return subChild
        }
      }
      return null
    }

    static getAllChilds() {
      const childs = [this]
      for (const child of this.definition.childs) {
        childs.push(...child.getAllChilds())
      }
      return childs
    }

  }
})
