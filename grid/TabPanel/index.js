const template = require('./template.html')
const Array = require('sools-core/types/Array')
const Panel = require('../Panel')
const { getHoverState } = require('../utils')
require('./style.scss')




module.exports = class TabPanel extends Panel {

  constructor(...values) {
    super()
    this.objects = new Array(...values)
    this.currentObject = values[0]
  }

  drag(object) {
    this.grid.dragInfos = {
      panel: this,
      object,
    }
  }

  dragEnd(){
    this.grid.dragEnd()
  }

  removeObject(object) {
    this.objects.remove(object)
    object.scope.destroy(object.element)
    if (!this.removeIfEmpty()) {
      this.currentObject = this.objects[0]
    }
  }

  removeIfEmpty() {
    if (this.objects.length) {
      return false
    }
    this.row.remove(this)
    this.grid.removeRowIfEmpty(this.row)

    if (this.grid.focusPanel === this) {
      this.grid.focusPanel = null
    }
    this.destroy()
    return true
  }

  async onDrop() {
    if (!this.grid.dragInfos) { return }
    if (!this.hover) { return }

    const { panel, object } = this.grid.dragInfos
    panel.objects.remove(object)

    const panelPosition = this.row.indexOf(this)

    if (['left', 'right'].indexOf(this.hover) !== -1) {
      const newPanel = await this.grid.createTabPanel(object)
      const position = panelPosition + (this.hover === 'right' ? 1 : 0)
      console.log(this.hover, position)
      this.grid.addRowItem(this.row, newPanel, position)
    } else if (['top', 'bottom'].indexOf(this.hover) !== -1) {
      const newPanel = await this.grid.createTabPanel(object)
      if (this.row.length === 1) {
        const rowPosition = this.row.column.indexOf(this.row)
        const position = rowPosition + (this.hover === 'bottom' ? 1 : 0)
        const column = this.row.column
        const row = this.grid.addRow(column, new Array(), position)
        this.grid.addRowItem(row, newPanel)
      } else {
        const rootRow = this.row
        rootRow.remove(this)
        const column = new Array()
        let panels = [newPanel, this]
        if (this.hover === 'bottom') {
          panels = panels.reverse()
        }
        for (const panel of panels) {
          panel.grid = this.grid
          const row = this.grid.addRow(column, new Array())
          this.grid.addRowItem(row, panel)
        }

        this.grid.addRowItem(rootRow, column, panelPosition)
      }
    } else if (this.hover === 'full') {
      this.objects.push(object)
    }

    if (this !== panel) {
      this.removeIfEmpty()
    }

    if(!panel.removeIfEmpty()){
      panel.currentObject = panel.objects[0]
    }
    
    this.hover = null
  }

  onDragOver(node, e) {
    if (!this.grid.dragInfos) { return }
    const { panel, object } = this.grid.dragInfos
    if (this === panel && panel.objects.length === 1) {
      panel.hover = null
      return
    }
    e.preventDefault()
    this.hover = getHoverState(node, e)
  }

  destroy() {
    super.destroy()
    this.objects.forEach(({ scope }) => scope.destroy())
  }
}
  .define({
    name: 'grid-tab-panel',
    template,
  })
  .properties({
    currentObject: 'any',
    hover: 'any',
  })