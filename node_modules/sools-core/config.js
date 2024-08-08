


module.exports = (...subConfigs) => {

  const config = {}

  const processObject = (configObject, object) => {
    Object.entries(object)
      .forEach(([key, value]) => {
        const configValue = configObject[key]
        if (!configValue) {
          configObject[key] = value
          return
        }
        const valueType = typeof value
        const configType = typeof configValue
        if (valueType !== configType) {
          throw new Error()
        }

        if (valueType === 'object') {
          if (Array.isArray(value)) {
            configObject[key] = value
            return
          }
          processObject(configValue, value)
          return
        }

        configObject[key] = value
      })
  }

  subConfigs.forEach((subConfig) => processObject(config, subConfig))
  return config
}