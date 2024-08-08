const template = require('./template.html')
const Component = require('../../Component')
require('./style.scss')

module.exports = class ContextMenu extends Component {
  onInit() {
    this.contextMenu = this.closest('context-menu')
  }

  onSelected(){
    console.log('on selected')
    this.event('selected')
    this.contextMenu.open = false
  }
}
  .define({
    name: 'context-menu-item',
    template,
  })