const bound = (int, [min, max]) => {
  if (int < min) {
    return min
  }
  if (int > max) {
    return max
  }
  return int
}

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  bound,
  random,
}