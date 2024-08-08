const Component = require('../../Component')
const template = require('./template.html')

require('./style.scss')


module.exports = class ModalContainer extends Component {
  constructor() {
    super()
    if (this.constructor.instance) { throw new Error('ModalContainer already instanciated') }
    this.constructor.instance = this
  }

  removeListener() {
    if (this.modal) {
      this.modal.off('destroyed', this.b(this.onModalDestroyed))
    }
  }

  show(modal) {
    this.removeListener()
    this.modal = modal
    if (this.modal) {
      this.modal.on('destroyed', this.b(this.onModalDestroyed))
    }
  }

  onModalDestroyed() {
    this.removeListener()
    this.modal = null
  }

  close() {
    this.modal = null
  }
}
  .define({
    name: 'modal-container',
    template,
  })
  .properties({
    modal: 'any',
  })
