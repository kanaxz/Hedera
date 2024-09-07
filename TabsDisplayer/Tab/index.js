const Component = require('sools-hedera/Component')
const template = require('./template.html')
require('./style.scss')

module.exports = class Tab extends Component {
  constructor() {
    super()
    this.display = true
    this.on('propertyChanged:display', this.b(this.onDisplayChanged))
  }
  focus() {
    this.parentElement.focus(this)
  }

  onDisplayChanged() {
    if (this.display) { return }
    if (this.parentElement.currentTab === this) {
      this.parentElement.currentTab = this.parentElement.tabs.find((tab) => tab.display)
    }
  }
}
  .define({
    name: 'tabs-tab',
    template
  })
  .properties({
    name: 'any',
    display: 'any',
  })