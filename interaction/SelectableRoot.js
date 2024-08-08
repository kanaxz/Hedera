const Virtual = require('../Virtual')
const Selectable = require('./Selectable')

const keys = [
  [(e) => e.key === 'ArrowUp', -1],
  [(e) => e.key === 'ArrowDown', 1],
  [(e) => e.key === 'ArrowRight', 1],
  [(e) => e.key === 'ArrowLeft', -1],
  [(e) => e.key === 'Tab' && !e.shiftKey, 1],
  [(e) => e.key === 'Tab' && e.shiftKey, -1],
]

const modes = {
  horizontal: ['ArrowRight', 'ArrowLeft', 'Tab'],
  vertical: ['ArrowUp', 'ArrowDown', 'Tab']
}

module.exports = class SelectableRoot extends Virtual {
  async onInit() {
    this.mode = 'vertical'
    if (this.initialValue) {
      await this.bind('mode', this.initialValue)
    }
    this.el.setAttribute('selectable-root', '')
    this.el.setAttribute('tabindex', '0')
    this.listen(this.el, 'keydown', this.b(this.onKeyDown), true)
  }

  focus() {
    const current = this.getSelected()
    if (!current) {
      this.selectFirst()
    }
  }

  getSelectable(node) {
    return node.hederaStates.find((s) => s.virtuals?.find((v) => v instanceof SelectableRoot.Selectable)?.root === this)
  }


  getSelectables(selector = '') {
    return [...this.el.querySelectorAll(`[selectable]${selector}`)]
      .filter((n) => this.getSelectable(n))
  }

  getSelected() {
    return this.getSelectables('.selected')[0]
  }

  selectFirst() {
    const first = this.getSelectables()[0]
    first.classList.add('selected')
  }

  select(selectable) {
    const current = this.getSelected()
    if (current) {
      current.classList.remove('selected')
    }
    selectable.classList.add('selected')
  }

  async onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const selected = this.getSelected()
      await this.getSelectable(selected).callback()
      return
    }
    const mode = this.mode
    if (modes[mode].indexOf(e.key) === -1) { return }

    const key = keys.find(([check]) => check(e))
    if (!key) { return }

    e.preventDefault()
    const current = this.getSelected()
    if (!current) {
      this.selectFirst()
    } else {
      const selectables = this.getSelectables()
      const currentIndex = selectables.indexOf(current)
      let nextIndex = currentIndex + key[1]

      if (nextIndex >= selectables.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = selectables.length - 1
      }
      const next = selectables[nextIndex]
      if (next) {
        current.classList.remove('selected')
        next.classList.add('selected')
      }
    }
  }
}
  .define({
    name: 'selectableRoot'
  })
  .properties({
    mode: 'any',
  })
