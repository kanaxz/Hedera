const BindingFunction = require('./BindingFunction')

const expressionRegex = /{{.*?}}/g

module.exports = class BindingExpression {
  constructor(expression, variables, callback) {
    this.expression = expression
    this.variables = variables
    this.callback = callback
    this.functions = []
  }

  async update() {
    let value = this.expression
    this.destroy()
    this.functions = []
    for (const path of this.expression.match(expressionRegex)) {
      const sanitizePath = path.replace('{{', '').replace('}}', '')
      const bindingFunction = new BindingFunction(sanitizePath, this.variables, async () => {
        await this.update()
      })

      bindingFunction.update(false)
      const initialValue = await bindingFunction.getValue()
      value = value.replace(path, initialValue)
      this.functions.push(bindingFunction)
    }

    this.expression.match(expressionRegex)
    await this.callback(value)
  }

  destroy() {
    this.functions.forEach((p) => p.destroy())
  }
}
