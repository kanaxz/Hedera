const focusable = 'button, input,href, select, textarea, [tabindex]:not([tabindex="-1"])'


const getFocusables = () => {
  return [...document.querySelectorAll(focusable)]
    .filter((el) => {
      return el.offsetParent
    })
}

const focusFromCurrent = (increment) => {
  const focusables = getFocusables()
  let index = focusables.indexOf(document.activeElement)
  if (index === -1) {
    index = 0
  } else {
    index = index + increment
    if (index > focusables.length) {
      index = 0
    } else if (index < 0) {
      index = focusables.length - 1
    }
  }
  const next = focusables[index]
  next.focus()
}

const next = () => {
  focusFromCurrent(+1)
}
const previous = () => {
  focusFromCurrent(-1)
}

const focusFirst = (el) => {
  const first = el.querySelector(focusable)
  if (first) {
    first.focus()
  }
}

const tab = {
  next,
  previous,
  focusFirst
}


module.exports = tab