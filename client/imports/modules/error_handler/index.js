import { Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const ErrorHandler = function () {
};

ErrorHandler.prototype = {
  getErrorMessage(err, result) {
    let errorMessage = 'unknown-error';
    let code = '';
    if (err) {
      code = `[${err.error}]`;
      if (err.details && err.details.message) {
        // external error comes with directly throwing (err.error = code)
        errorMessage = err.details.message;
      } else if (err.reason) {
        // internal error comes with directly throwing (err.error = code)
        errorMessage = err.reason;
      }
    } else if (result && result.error) {
      code = result.error.error ? `[${result.error.error}]` : '';

      if (result.error.details && result.error.details.message) {
        // external error comes with callback throwing
        errorMessage = result.error.details.message;
      }
      if (result.error.message) {
        // external error comes with callback throwing (no details, comes as MongoError)
        errorMessage = result.error.message;
      }
    }

    return { code, errorMessage };
  },

  showMeteorFuncError(err, result, translateOptions) {
    const { code, errorMessage } = this.getErrorMessage(err, result);
    Notification.error(errorMessage, null, translateOptions, code);
  }
};

export default new ErrorHandler();
