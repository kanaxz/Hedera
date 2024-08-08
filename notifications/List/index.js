const Component = require('sools-hedera/Component')
const template = require("./template.html")
const { notifications } = require('sools-hedera/global')
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
