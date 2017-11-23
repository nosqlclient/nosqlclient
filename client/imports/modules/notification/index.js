/* global swal */
const toastr = require('toastr');
const ladda = require('ladda');

const Notification = function () {
};

Notification.prototype = {
  notify({ type, message, options }) {
    toastr[type](message, options);
  },

  info(message, options) {
    this.notify({ type: 'info', message, options });
  },

  success(message, options) {
    this.notify({ type: 'success', message, options });
    ladda.stopAll();
  },

  warning(message, options) {
    this.notify({ type: 'warning', message, options });
    ladda.stopAll();
  },

  error(message, options) {
    this.notify({ type: 'error', message, options });
    ladda.stopAll();
  },

  start(selector) {
    ladda.create(document.querySelector(selector)).start();
  },

  stop() {
    ladda.stopAll();
  },

  modal({ title, text, type, callback, showCancelButton = true, closeOnConfirm = true, confirmButtonText = 'Yes, please', cancelButtonText = 'Cancel' }) {
    swal({
      title,
      text,
      html: true,
      type,
      showCancelButton,
      confirmButtonColor: '#DD6B55',
      confirmButtonText,
      closeOnConfirm,
      cancelButtonText
    }, callback);
  },

  closeModal() {
    swal.close();
  },

  showModalInputError(message) {
    swal.showInputError(message);
  }
};

export default new Notification();
