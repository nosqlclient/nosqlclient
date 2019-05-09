import { Notification, ErrorHandler } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';

const FileManagementHelper = function () {};

FileManagementHelper.prototype = {
  proceedUploading(blob, contentType, metaData, aliases, initFilesInformation) {
    Notification.start('#btnUpload');

    const fileReader = new FileReader();
    fileReader.onload = (file) => {
      Communicator.call({
        methodName: 'uploadFile',
        args: { bucketName: $('#txtBucketName').val(), blob: new Uint8Array(file.target.result), fileName: blob.name, contentType, metaData, aliases },
        callback: (err, result) => {
          if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
          else {
            Notification.success('saved-successfully');
            initFilesInformation();
          }
        }
      });
    };
    fileReader.readAsArrayBuffer(blob);
  },

  convertObjectIdAndDateToString(arr) {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i]._id) arr[i]._id = arr[i]._id.$oid;
      if (arr[i].uploadDate) arr[i].uploadDate = arr[i].uploadDate.$date;
    }
  },

  proceedShowingMetadata(id, jsonEditor) {
    Communicator.call({
      methodName: 'getFile',
      args: { bucketName: $('#txtBucketName').val(), fileId: id },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else jsonEditor.set(result.result);

        Notification.stop();
      }
    });
  }
};


export default new FileManagementHelper();
