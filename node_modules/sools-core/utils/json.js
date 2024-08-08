const parse = (string) => {
  string = string.replace(/\s*(['"])?([a-z0-9A-Z_\.]+)(['"])?\s*:([^,\}]+)(,)?/g, '"$2": $4$5');
  return JSON.parse(string)
}


module.exports = {
  parse,
}