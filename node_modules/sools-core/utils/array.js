const chain = (array, fn, final) => {
  let index = 0
  const inner = () => {
    if (index === array.length) {
      return final()
    }

    const object = array[index++]
    return fn(object, inner)
  }
  return inner()
}

module.exports = {
  chain,
}