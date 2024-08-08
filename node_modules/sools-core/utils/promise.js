
const wait = (duration) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(resolve, duration)
  })

  return promise
}

const immediate = () => wait(0)

module.exports = {
  wait,
  immediate,
}