
const eventCallback = () => {
  const callback = (...args) => {
    callback.triggered = true
    callback.args = args
  }
  callback.triggered = false
  return callback
}

module.exports = {
  eventCallback
}