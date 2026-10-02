import { ReactivityProvider, Communicator } from '/client/imports/facades';
import { SessionManager, ErrorHandler } from '/client/imports/modules';

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
    if (!selectedCollection || selectedCollection.endsWith('.chunks')) {
      SessionManager.set(SessionManager.strSessionDistinctFields, []);
      // ignore chunks
      return;
    }

    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    const countToTake = Number.isNaN(parseInt(settings.autoCompleteSamplesCount, 10)) ? 50 : parseInt(settings.autoCompleteSamplesCount, 10);
    if (countToTake <= 0) {
      SessionManager.set(SessionManager.strSessionDistinctFields, []);
      // ignore chunks
      return;
    }

    // $sample picks random documents without counting or skipping through the collection,
    // so its cost doesn't grow with collection size (count + random skip were full scans).
    Communicator.call({
      methodName: 'aggregate',
      args: { selectedCollection, pipeline: [{ $sample: { size: countToTake } }] },
      callback: (err, samples) => {
        // aggregate is unblocked on the server, so samples for a previously selected collection can arrive late
        if (SessionManager.get(SessionManager.strSessionSelectedCollection) !== selectedCollection) return;

        if (err || samples.error) ErrorHandler.showMeteorFuncError(err, samples);
        else {
          const keys = findKeysOfObject(samples.result);
          SessionManager.set(SessionManager.strSessionDistinctFields, keys);
        }
      }
    });
  }

};

export default new Querying();
