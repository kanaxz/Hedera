const template = require('./template.html')
const Component = require('../../Component')
require('./style.scss')

module.exports = class ContextMenu extends Component {
  onInit() {
    this.listen(this.parentElement, 'contextmenu', this.b(this.onContextMenu))
  }

  onContextMenu(e) {
    if (this.contains(e.target)) { return }
    this.left = e.offsetX
    this.top = e.offsetY
    e.preventDefault()
    this.open = true
    this.focus()
  }
}
  .define({
    name: 'context-menu',
    template,
  })
  .properties({
    open: 'any',
    left: 'any',
    top: 'any',
  })