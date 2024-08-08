const Virtual = require('../Virtual')
const SelectableRoot = require('./SelectableRoot')

class Selectable extends Virtual {
  async onInit() {
    await this.bind('callback', `()=>${this.initialValue}`)
    const rootEl = this.el.closest('[selectable-root]')
    if (!rootEl) {
      throw new Error('Root not found')
    }

    const state = rootEl.hederaStates.find((s) => s.virtuals?.find((v) => v instanceof SelectableRoot))
    const root = state.virtuals.find((v) => v instanceof SelectableRoot)
    this.root = root
    this.el.setAttribute('selectable', '')

    this.listen(this.el, 'click', (e) => {
      root.select(this.el)
    })

    this.listen(this.el, 'dblclick', (e) => {
      this.callback()
    })

    root.focus()
  }
}
Selectable
  .define({
    name: 'selectable'
  })
  .properties({
    callback: 'any',
    mode: 'any',
    within: 'any',
  })

SelectableRoot.Selectable = Selectable
module.exports = Selectable
