
const find = (root, childsGetter, callback) => {
  const childs = childsGetter(root)
  for (const child of childs) {
    if (callback(child)) {
      return child
    }
    const sub = find(child, childsGetter, callback)
    if (sub) {
      return sub
    }
  }
  return null
}


module.exports = {
  find,
}