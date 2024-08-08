const { set } = require('sools-core/utils/path')

const as = (scope, node) => {
  const as = node.getAttribute('as')
  if (!as) { return }
  //console.log('as',thisArg, as, node)
  node.removeAttribute('as')
  set(scope.variables.this, as, node)
}

const attach = (scope, node) => {
  if (!node.getAttribute('attach') || !node.id) { return }

  set(scope.variables.this, node.id, node)
}

const _in = (scope, node) => {
  const attr = node.getAttribute('in')
  if (!attr) { return }
  const thisArg = scope.variables.this
  if (!thisArg[attr]) {
    thisArg[attr] = []
  }
  thisArg[attr].push(node)
}

module.exports = {
  process(scope, { node }) {
    if (node.nodeType !== Node.ELEMENT_NODE) { return }

    as(scope, node)
    attach(scope, node)
    _in(scope, node)
  }
}