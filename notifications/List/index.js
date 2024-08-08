const Component = require('hedera/Component')
const template = require("./template.html")
const { notifications } = require('hedera/global')
require("./style.scss");


module.exports = class NotificationsList extends Component {

}

  .define({
    name: "notifications-list",
    template,
  })
  .variables({
    service: notifications,
  })
