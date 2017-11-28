import { ReactivityProvider, Communicator } from '/client/imports/facades';
import { SessionManager, ErrorHandler, Notification } from '/client/imports/modules';

const Querying = function () {};

const findKeysOfObject = function (resultArray) {
  const result = [];

  resultArray.forEach((object) => {
    Object.keys(object).forEach((key) => {
      if (result.indexOf(key) === -1) result.push(key);
    });
  });
  return result;
};

Querying.prototype = {
  getDistinctKeysForAutoComplete(selectedCollection) {
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    const countToTake = Number.isNaN(parseInt(settings.autoCompleteSamplesCount, 10)) ? 50 : parseInt(settings.autoCompleteSamplesCount, 10);
    if (selectedCollection.endsWith('.chunks') || countToTake <= 0) {
      SessionManager.set(SessionManager.strSessionDistinctFields, []);
      // ignore chunks
      return;
    }

    Communicator.call({
      methodName: 'count',
      args: { selectedCollection },
      callback: (countError, result) => {
        if (countError || result.error) ErrorHandler.showMeteorFuncError(countError, result);
        else {
          Communicator.call({
            methodName: 'find',
            args: { selectedCollection, cursorOptions: { limit: countToTake, skip: Math.round(Math.random() * result.result) } },
            callback: (err, samples) => {
              if (err || samples.error) ErrorHandler.showMeteorFuncError(err, samples);
              else {
                const keys = findKeysOfObject(samples.result);
                SessionManager.set(SessionManager.strSessionDistinctFields, keys);
                Notification.stop();
              }
            }
          });
        }
      }
    });
  }

};

export default new Querying();
