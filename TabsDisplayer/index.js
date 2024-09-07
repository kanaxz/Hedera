const template = require('./template.html')
const Component = require('sools-hedera/Component')
const Array = require('sools-core/types/Array')
require('./style.scss')
require('./Tab')

module.exports = class TabsDisplayer extends Component {

  onInit() {
    this.tabs = new Array()
  }

  onInit() {
    console.log(...this.tabs.map((t) => t.name))
    this.focus(this.tabs?.[0])
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