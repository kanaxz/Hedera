const template = require('./template.html')
const Component = require('sools-hedera/Component')
const Array = require('sools-core/types/Array')
require('./style.scss')
require('./Tab')

module.exports = class TabsDisplayer extends Component {

  onInit() {
    this.tabs = new Array()
  }

  onReady() {
    while (this.initSlot.firstElementChild) {
      const node = this.initSlot.firstElementChild
      node.remove()
      this.tabs.push(node)
    }
    this.currentTab = this.tabs[0]
  }

  focus(tab) {
    this.currentTab = tab
  }
}
  .define({
    name: 'tabs-displayer',
    template,
  })
  .properties({
    currentTab: 'any',
  })