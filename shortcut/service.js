
let displayed = false
const className = 'shortcut'
const check = (e) => e.altKey



window.addEventListener('keydown', (e) => {
  if (e.altKey) { e.preventDefault() }
  if (!check(e)) { return }

  document.body.classList.add(className)
})

window.addEventListener('keyup', (e) => {
  if (check(e)) { return }

  document.body.classList.remove(className)
})
