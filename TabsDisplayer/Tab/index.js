const Component = require('sools-hedera/Component')
const template = require('./template.html')
require('./style.scss')

module.exports = class Tab extends Component {

}
  .define({
    name: 'tabs-tab',
    template
  })
  .properties({
    name: 'any',
    display: 'any',
  })