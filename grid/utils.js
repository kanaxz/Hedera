const getHoverState = (node, e) => {
  const percent = 5
  if (e.offsetX < node.offsetWidth / percent) {
    return 'left'
  } else if (e.offsetX > node.offsetWidth - node.offsetWidth / percent) {
    return 'right'
  } else if (e.offsetY < node.offsetHeight / percent) {
    return 'top'
  } else if (e.offsetY > node.offsetHeight - node.offsetHeight / percent) {
    return 'bottom'
  } else {
    return 'full'
  }
}

module.exports = {
  getHoverState
}