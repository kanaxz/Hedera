


const isCustomElement = (node) => {
  return node.tagName && typeof customElements.get(node.tagName.toLowerCase()) != "undefined";
}

const createFunction = (stringFunction, variables = {}) => {
  const functionArgs = []
  const variablesArgs = []

  for (var [name, value] of Object.entries(variables)) {
    functionArgs.push(name)
    variablesArgs.push(value)
  }
  functionArgs.push(stringFunction)
  return function () {

    const fn = Function.apply(null, functionArgs)
    return fn.apply(this, variablesArgs)
  }
}


const dashToCamel = (string) => string.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

const attributes = {
  class(node, value) {
    value.split(' ').forEach((cssClass) => {
      node.classList.add(cssClass)
    })
  },
}

const moveAttributes = (from, to, exclude = []) => {
  [...from.attributes]
    .forEach((attr) => {
      if (exclude.indexOf(attr.name) !== -1) { return }
      from.removeAttribute(attr.name)
      const attrType = attributes[attr.name]
      if (attrType) {
        attrType(from, attr.value)
      } else {
        to.setAttribute(attr.name, attr.nodeValue)
      }

    })
}

module.exports = {
  dashToCamel,
  createFunction,
  isCustomElement,
  template: require('./template'),
  moveAttributes
}