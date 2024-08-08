const mixer = require("../mixer")
const Destroyable = require("./Destroyable")
const events = Symbol("events")
const otherEvents = Symbol("otherEvents")

class Listener {
  constructor(options) {
    Object.assign(this, options)
  }

  remove() {
    this.eventable.off(this)
  }
}


const Eventable = mixer.mixin([Destroyable], (baseClass) => {
  return class Eventable extends baseClass {
    constructor(...args) {
      super(...args)
      Object.defineProperties(this, {
        [events]: {
          enumerable: false,
          writable: true,
          value: []
        },
        [otherEvents]: {
          enumerable: false,
          writable: true,
          value: []
        }
      })
    }

    on(...args) {
      if (args.length === 3) {
        const [source, eventName, callback] = args
        const listener = source.on(eventName, callback)
        this[otherEvents].push(listener)
        return listener
      } else {
        const [eventName, callback] = args
        const listener = new Listener({
          eventable: this,
          eventName,
          callback,
        })
        let event = this[events][eventName]
        if (!event) {
          event = {
            listeners: []
          }
          this[events][eventName] = event
        }

        this[events][eventName].listeners.push(listener)

        return listener
      }
    }

    async emit(eventName, args = [], options = {}) {
      let event = this[events][eventName]
      if (!event) {
        event = {
          listeners: [],
        }
        this[events][eventName] = event
      }
      const listeners = [...event.listeners]
      await Promise.all(listeners.map((l) => l.callback(...args)))
    }

    off(eventName, callback) {
      if (eventName instanceof Listener) {
        callback = eventName.callback
        eventName = eventName.eventName
      }

      const event = this[events][eventName]
      if (!event) { return }
      const index = event.listeners.findIndex((listener) => listener.eventName === eventName && listener.callback === callback)

      if (index === -1) { return }
      event.listeners.splice(index, 1)
    }

    destroy() {
      super.destroy()
      Object.values(events)
        .forEach((event) => {
          event.listeners.forEach((listener) => {
            listener.remove()
          })
        })

      this[otherEvents].forEach((listener) => listener.remove())
      this[otherEvents] = null
      this.emit('destroyed')
    }
  }
})

Object.assign(Eventable, {
  events,
  otherEvents
})

module.exports = Eventable