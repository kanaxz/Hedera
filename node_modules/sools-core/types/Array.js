const mixer = require('../mixer')
const Bindeable = require('../mixins/Bindeable')
const Destroyable = require('../mixins/Destroyable')
const Eventable = require('../mixins/Eventable')

module.exports = class IntermediateArray extends mixer.extends(Array, [Eventable, Destroyable, Bindeable]) {

  push(...args) {
    const result = super.push(...args)
    this.changed()
    return result
  }

  pop(...args) {
    const result = super.pop(...args)
    this.changed()
    return result
  }

  unshift(...args) {
    const result = super.unshift(...args)
    this.changed()
    return result
  }

  shift(...args) {
    const result = super.shift(...args)
    this.changed()
    return result
  }

  splice(...args) {
    const result = super.splice(...args)
    this.changed()
    return result
  }

  /*
  sort(...args) {
    const result = super.sort(...args)
    this.changed()
    return result
  }
  */

  async changed() {
    await Promise.all([
      this.emit('changed'),
      this.emit('propertyChanged:length')
    ])
  }

  remove(object) {
    var result = this.tryRemove(object)
    if (!result)
      throw new RangeError()
  }

  tryRemove(object) {
    var index = this.indexOf(object);
    if (index != -1) {
      this.splice(index, 1)
      return true
    } else
      return false
  }

  has(object) {
    return this.indexOf(object) !== -1
  }

  onLinkUpdated() {
    const { source, fn, args } = this.linkOptions
    this.splice(0, this.length)
    const result = source[fn](...args)
    this.push(...result)
  }

  link(source, fn, ...args) {
    this.linkOptions = {
      source,
      fn,
      args,
    }
    this.on(source, 'changed', this.b(this.onLinkUpdated))
  }

  filterLink(fn) {
    const array = new IntermediateArray()
    array.link(this, 'filter', fn)
    const result = this.filter(fn)
    array.push(...result)
    return array
  }

  sortLink(fn) {
    const array = new IntermediateArray()
    array.link(this, 'sort', fn)
    const result = this.sort(fn)
    array.push(...result)
    return array
  }
}