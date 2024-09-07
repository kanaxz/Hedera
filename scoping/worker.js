const { workers } = require('../global')

workers.push({
  process(scope, { node }) {
    if (node.nodeType !== Node.ELEMENT_NODE) { return }
    if (!node.hasAttribute('slot')) { return }
    const slotName = node.getAttribute('slot') || 'main'
    node.removeAttribute('slot')

    scope.slots[slotName] = {
      node,
      children: [...node.childNodes]
    }
  }
})
