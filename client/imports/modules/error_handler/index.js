import { Notification } from '/client/imports/modules';

const ErrorHandler = function () {
};

ErrorHandler.prototype = {
  getErrorMessage(err, result) {
    let errorMessage = '';
    if (err && err.details && err.details.message) errorMessage = `[${err.error}] ${err.details.message}`;
    else if (err && err.message) errorMessage = `[${err.error}] ${err.message}`;
    else if (result && result.error && result.error.details && result.error.details.message) errorMessage = `[${result.error.error}] ${result.error.details.message}`;
    else if (result && result.error && result.error.message) errorMessage = result.error.code ? `[${result.error.code}] ${result.error.message}` : result.error.message;
    else if (result && result.error) errorMessage = JSON.stringify(result.error);

    return errorMessage;
  },

  showMeteorFuncError(err, result) {
    console.log(err, result);
    const errorMessage = this.getErrorMessage(err, result);
    Notification.error(errorMessage || 'unknown error');
  }
};

export default new ErrorHandler();
