
const validateType = (accept, type) => {
  const [category, extension] = type.split('/')
  return accept.some((t) => {
    if (t === '*' || t === type) { return true }
    const [c, e] = t.split('/')
    if (e === '*' && c === category) { return true }

    return false
  })
}

module.exports = {
  validateType,
}