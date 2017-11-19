const toastr = require('toastr');
const ladda = require('ladda');

const Notification = function () {
};

Notification.prototype = {
  notify({ type, message }) {
    toastr[type](message);
    ladda.stopAll();
  },

  info(message) {
    this.notify({ type: 'info', message });
  },

  success(message) {
    this.notify({ type: 'success', message });
  },

  error(message) {
    this.notify({ type: 'error', message });
  },

  stop() {
    ladda.stopAll();
  }
};

export default new Notification();
