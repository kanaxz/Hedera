const template = require('./template.html')
const Component = require('../../Component')
const Array = require('sools-core/types/Array')
const Panel = require('../Panel')
const { getElementFromTemplate } = require('../../utils/template')
const TabPanel = require('../TabPanel')
const { getHoverState } = require('../utils')

require('./style.scss')

module.exports = class EditableGrid extends Component {
  constructor() {
    super()
    this.maxDeepth = 2
    this.size = [3, 2]
  }

  onInit() {
    this.column = new Array()
    this.addRow(this.column, new Array())
  }

  onReady() {
    for (const element of this.initSlot.children) {
      this.add(element)
    }
  }

  findFirstPanel(array) {
    if (!array) {
      array = this.column
    }
    for (const object of array) {
      if (object instanceof Panel) {
        return object
      }
      const panel = this.findFirstPanel(object)
      if (panel) {
        return panel
      }
    }
    return null
  }

  addRowItem(row, item, position) {
    if (position === undefined) {
      position = row.length
    }
    item.row = row
    item.grid = this
    row.splice(position, 0, item)
    return item
  }

  addRow(column, row, position) {
    if (position === undefined) {
      position = column.length
    }
    column.splice(position, 0, row)
    row.column = column
    return row
  }

  async add(object) {
    if (object instanceof Panel) {
      object.grid = this
      this.column[0].push(object)
      return
    }
    const objectInfos = await this.templateObject(object)
    if (!this.focusPanel) {
      const panel = await this.createTabPanel(objectInfos)
      const row = this.column[0]
      this.addRowItem(row, panel, row.length)
      this.focusPanel = panel
    } else {
      this.focusPanel.objects.push(objectInfos)
      this.focusPanel.currentObject = objectInfos
    }
  }

  repositionColumn(column) {
    if (column.length !== 1 || !column.row) { return }

    const columnIndex = column.row.indexOf(column)

    column.row.splice(columnIndex, 1)
    for (const object of column[0].reverse()) {
      this.addRowItem(column.row, object, columnIndex)
    }
  }

  async createTabPanel(...args) {
    const panel = new TabPanel(...args)
    panel.grid = this
    return this.scope.render(panel)
  }

  async cell(object, scope) {
    if (object instanceof Panel) {
      return object
    }
    const child = scope.child()
    let element = getElementFromTemplate(this.columnTemplate)
    child.variables.column = object
    element = await child.render(element)
    return element
  }


  removeRowIfEmpty(row) {
    if (row.length || (!row.column.row && row.column.length === 1)) {
      //this.repositionRow(row)
      return
    }
    row.column.remove(row)
    this.removeColumnIfEmpty(row.column)
  }

  removeColumnIfEmpty(column) {
    if (column.length || !column.row) {
      this.repositionColumn(column)
      return false
    }
    column.row.remove(column)
    this.removeRowIfEmpty(column.row)
    return true
  }

  async templateObject(data) {
    const template = this.templates.find((t) => data instanceof t.for)
    let element = getElementFromTemplate(template)
    const child = this.scope.parent.child()
    child.variables[template.as || 'data'] = data
    element = await child.render(element)
    return {
      data,
      element,
      scope: child,
    }
  }

  onRowDragOver(row, node, e) {
    if (row.column.length === 1) { return }
    e.preventDefault()
    this.hoverRow = node
    this.hoverMode = getHoverState(node, e)
  }

  onRowDrop(row) {

  }

  dragEnd(){
    this.dragInfos = null
    this.hoverMode = null
    this.hoverMode = null
  }
}
  .define({
    name: 'editable-grid',
    template,
  })
  .variables({
    Panel,
  })
  .properties({
    dragInfos: 'any',
    focusPanel: 'any',
    hoverRow: 'any',
    hoverMode: 'any',
  })