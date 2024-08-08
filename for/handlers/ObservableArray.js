const mixer = require('sools-core/mixer')
const Bindeable = require('sools-core/mixins/Bindeable')

const Array = require('sools-core/types/Array')
const Eventable = require('sools-core/mixins/Eventable')

module.exports = class ObservableArrayHandler extends mixer.extends([Bindeable, Eventable]) {
  static handle(source) {
    return source instanceof Array
  }

  constructor(repeater) {
    super()
    this.repeater = repeater
    this.source = this.repeater.source
    this.on(this.source, 'changed', this.b(this.onSourceChanged))
    this.timeout = null
  }


  insertIt(itToInsert) {
    const { index, element } = itToInsert
    const parent = this.repeater.el
    if (element === parent.children[index]) { return }
    if (index >= parent.children.length) {
      parent.appendChild(element)
    } else {
      parent.insertBefore(element, parent.children[index])
    }
  }

  onSourceChanged() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => this.updateIterations())
  }

  async updateIterations() {
    if (this.destroyed) { return }
    const processedIts = []
    for (const object of this.source) {
      const index = this.source.indexOf(object)
      let it = this.repeater.iterations.find((it) => it.object === object)
      if (it) {
        it.index = index
        this.insertIt(it)
      } else {
        it = this.repeater.iteration(object, index)
        this.insertIt(it)
        it.element = await it.scope.render(it.element)
      }
      processedIts.push(it)
    }

    const its = [...this.repeater.iterations]
    for (const it of its) {
      const index = processedIts.indexOf(it)
      if (index === -1) {
        it.destroy()
        const i = this.repeater.iterations.indexOf(it)
        this.repeater.iterations.splice(i, 1)
      }
    }
  }

}

