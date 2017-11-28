import { Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const ErrorHandler = function () {
};

ErrorHandler.prototype = {
  getErrorMessage(err, result, translateOptions) {
    let errorMessage = Helper.translate({ key: 'unknown-error' });
    if (err) {
      if (err.details && err.details.message) {
        // external error comes with directly throwing (err.error = code)
        errorMessage = `[${err.error}] ${Helper.translate({ key: err.details.message, options: translateOptions })}`;
      } else if (err.reason) {
        // internal error comes with directly throwing (err.error = code)
        errorMessage = `[${err.error}] ${Helper.translate({ key: err.reason, options: translateOptions })}`;
      }
    } else if (result && result.error) {
      if (result.error.details && result.error.details.message) {
        // external error comes with callback throwing
        errorMessage = result.error.error ? `[${result.error.error}] ${result.error.details.message}` : result.error.details.message;
      } else if (result.error.message) {
        // external error comes with callback throwing (no details, comes as MongoError)
        errorMessage = result.error.error ? `[${result.error.error}] ${result.error.message}` : result.error.message;
      } else if (result.error.errmsg) {
        // external error comes from saveFindResult etc.
        errorMessage = result.error.error ? `[${result.error.error}] ${result.error.errmsg}` : result.error.errmsg;
      }
    }

    return errorMessage;
  },

  showMeteorFuncError(err, result, translateOptions) {
    Notification.errorNoTranslate(this.getErrorMessage(err, result, translateOptions));
  }
};

export default new ErrorHandler();
