const { set, get } = require('./path')

const processMapping = (object, mapping) => {
  const processArg = (arg) => {
    if (!arg) { return undefined }
    if (typeof arg === 'function') {
      return arg(object)
    } else if (Array.isArray(arg)) {
      for (const subArg of arg) {
        const value = processArg(subArg)
        if (value !== undefined) {
          return value
        }
        return undefined
      }
    } else if (typeof arg === 'object') {
      return processMapping(object, arg)
    } else {
      return get(object, arg)
    }
  }

  return Object.entries(mapping)
    .reduce((acc, [newPath, old]) => {
      const value = processArg(arg)
      if (value !== undefined) {
        set(acc, newPath, value)
      }
      return acc
    }, {})
}

const entries = (object) => {
  const result = [
    ...Object.entries(object)
  ]

  if (object.__proto__) {
    result.push(
      ...(entries(object.__proto__))
    )
  }
  return result
}

const keys = (object) => {
  const objectEntries = entries(object)
  return objectEntries.map(([key]) => key)
}

const values = (object) => {
  const objectEntries = entries(object)
  return objectEntries.map(([, value]) => value)
}

module.exports = {
  processMapping,
  entries,
  keys,
  values,
}