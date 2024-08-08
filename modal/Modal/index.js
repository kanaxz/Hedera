const Component = require('../../Component')
const template = require("./template.html")
const ModalContainer = require('../ModalContainer')
require("./style.scss");


module.exports = class Modal extends Component {
  constructor() {
    super()
    this.isOpened = false
  }

  show() {
    console.log('show', this)
    ModalContainer.instance.show(this)
    this.isOpened = true
  }

  close() {
    console.log('closing', this)
    this.isOpened = false
    ModalContainer.instance.close()
  }
}
  .define({
    name: "mo-dal",
    template,
  })
  .properties({
    title: 'any',
    isOpened: 'any',
  })
