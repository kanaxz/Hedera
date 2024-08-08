const Mixin = require('../Mixin')
const ExtensibleFunction = require('./ExtensibleFunction')

let id = 0
class Tree extends ExtensibleFunction {



  constructor(...values) {
    super((...args) => this.call(...args))
    this.content = values
  }
  call(...args) {
    this.push(...args)
    return this
  }
  push(...objs) {
    this.content.push(...objs)
  }

  get count() {
    let count = 0;
    for (let obj of this.content) {

      if (obj instanceof this.constructor) {
        count += obj.count
      } else {
        count++
      }
    }
    return count
  }

  forEach(fn) {
    for (var object of this) {
      fn(object);
    }
  }

  find(fn) {
    for (var obj of this) {
      if (fn(obj))
        return obj;
    }
    return null;
  }

  filter(fn) {
    var result = [];
    for (var obj of this) {
      if (fn(obj)) {
        result.push(obj);
      }
    }
    return result;
  }

  map(fn) {
    var result = [];
    for (var obj of this) {
      result.push(fn(obj));
    }
    return result;
  }

  reduce(fn, acc) {
    this.forEach((value) => {
      acc = fn(acc, value)
    })
    return acc
  }

  beautify() {
    return this.content.map((object) => {
      if (object instanceof this.constructor) {
        return object.beautify()
      }
      return object
    })
  }

  iterate(it) {
    if (it.index > this.content.length) {
      return {
        done: true
      }
    }
    let value = this.content[it.index]

    if (value instanceof this.constructor) {
      if (!this.shouldIterateTree(it, value)) {
        it.index++
        return this.iterate(it)
      }
      if (!it.it)
        it.it = value[Symbol.iterator](this)
      let result = it.it.next()
      if (result.done) {
        it.index++
        it.it = null
        return this.iterate(it)
      }
      value = result.value
    } else {
      it.index++
    }

    return {
      value,
      done: it.index > this.content.length
    }
  }

  shouldIterateTree(it, tree) {
    return true
  }

  [Symbol.iterator](from) {
    const it = {
      id: id++,
      index: 0,
      it: null,
      from
    }
    return {
      next: () => {
        return this.iterate(it)
      }
    }
  }

}

module.exports = Tree