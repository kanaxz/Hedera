
const forEach = (type, fn) => {
  while (type.prototype.__proto__) {
    const stop = fn(type)
    if (stop) {
      return
    }
    type = type.prototype.__proto__.constructor
  }
}

const get = (type) => {
  const result = []
  forEach(type, (t) => {
    result.push(t)
  })
  return result
}

const getParent = (type) => {
  return type.prototype.__proto__.constructor
}

const filter = (type, fn) => {
  const result = []
  forEach(type, (parent) => {
    const match = fn(parent)
    if (match) {
      result.push(parent)
    }
  })
  return result
}

const find = (type, fn) => {
  let result = null
  forEach(type, (parent) => {
    const match = fn(parent)
    if (match) {
      result = parent
      return true
    }
  })
  return result
}

const getCommonAncestor = (...types) => {
  let target = types[0]
  while (target) {
    let good = true
    for (const type of types) {
      if (type !== target && !(type.prototype instanceof target) && !(target.prototype instanceof type)) {
        good = false
      }
    }
    if (good) {
      return target
    }
    target = target.prototype.__proto__.constructor
  }
  return null
}

module.exports = {
  get,
  forEach,
  filter,
  find,
  getParent,
  getCommonAncestor,
}