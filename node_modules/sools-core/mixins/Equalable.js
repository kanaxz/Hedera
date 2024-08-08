const mixer = require("../mixer")

module.exports = mixer.mixin((baseClass) => {

  return class Equalable extends baseClass {
    static equals(value1, value2) {
      throw new Error('Compare not implemented')
    }
  }
})