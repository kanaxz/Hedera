const Component = require('../../Component')
const template = require('./template.html')
require('./style.scss')

module.exports = class ShortCuts extends Component { }
  .define({
    name: 'short-cuts',
    template
  })
