const Service = require('../Service')
const Array = require('sools-core/types/Array')
const Notification = require('./Notification')

const types = {
  info: {
    icon: '<i class="fa-solid fa-circle-info"></i>',
  },
  success: {
    icon: '<i class="fa-solid fa-check"></i>',
  },
  error: {
    icon: '<i class="fa-solid fa-exclamation"></i>',
  },
};

Object.entries(types).forEach(([name, type]) => {
  type.name = name;
})

module.exports = class NotificationService extends Service {
  constructor() {
    super()
    this.notifications = new Array()
  }
  notify(notification) {
    notification.type = types[notification.type] || types.info
    notification = new Notification(notification)
    this.notifications.push(notification)
  }
}
  .define()
  .properties({
    notifications: "any",
  })
