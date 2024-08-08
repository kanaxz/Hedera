const set = (object, path, value) => {
  const split = path.split('.')
  const name = split.pop()
  for (const segment of split) {
    object = object[segment]
  }
  object[name] = value
}

/**
 * it should throw an error if the path is invalid
 * @param {*} object 
 * @param {*} path 
 * @returns 
 */
const get = (object, path) => {
  const split = path.split('.')
  for (const segment of split) {

    object = object[segment]
  }

  return object
}

const pathsCopy = (paths) => {
  const copy = Object.entries(paths)
    .reduce((acc, [k, v]) => {
      if (typeof v === 'object') {
        v = pathsCopy(v)
      }
      acc[k] = v
      return acc
    }, {})
  return copy
}

/**
 * 
 * @param {*} paths1 
 * @param {*} paths2 
 * @returns a - b 
 */
const pathsDiff = (paths1, paths2) => {
  const diff = Object.entries(paths1)
    .reduce((acc, [propertyName, value1]) => {
      let value2 = paths2[propertyName]
      if (!value2) {
        if (value1) {
          acc[propertyName] = value1
        }
      } else {
        if (value2 === true) {
          value2 = {}
        }
        if (value1 === true) {
          value1 = {}
        }
        const subDiff = pathsDiff(value1, value2)
        if (Object.keys(subDiff).length) {
          acc[propertyName] = subDiff
        }
      }
      return acc
    }, {})

  return diff
}


module.exports = {
  set,
  get,
  pathsDiff,
  pathsCopy,
}