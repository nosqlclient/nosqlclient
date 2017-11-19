import { Notification } from '/client/imports/modules';

const ErrorHandler = function () {
};

ErrorHandler.prototype = {
  getErrorMessage(err, result) {
    let errorMessage;
    if (err && err.details && err.details.message) {
      errorMessage = `[${err.message}] ${err.details.message}`;
    } else if (err && err.message) {
      errorMessage = err.message;
    } else if (result && result.error && result.error.details && result.error.details.message) {
      errorMessage = `[${result.error.message}] ${result.error.details.message}`;
    } else if (result && result.error && result.error.message) {
      errorMessage = result.error.message;
    } else if (result && result.error) {
      errorMessage = JSON.stringify(result.error);
    }

    return errorMessage;
  },

  showMeteorFuncError(err, result) {
    const errorMessage = this.getErrorMessage(err, result);
    Notification.error(errorMessage || 'unknown error');
  }
};

export default new ErrorHandler();
