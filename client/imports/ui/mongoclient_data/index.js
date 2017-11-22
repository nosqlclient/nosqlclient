import { Notification } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';

const MongoclientData = function () {

};

MongoclientData.prototype = {
  proceedImportExport() {
    const laddaButton = Notification.start('#btnProceedImportExport');
    const importInput = $('#inputImportBackupFile');

    if (importInput.val()) {
      laddaButton.start();
      Helper.loadFile(null, importInput, (val) => {
        Communicator.call({
          methodName: 'importMongoclient',
          args: { file: val },
          callback: (err) => {
            if (err) Notification.error(`Couldn't import: ${err.message}`);
            else {
              Notification.success(`Successfully imported from ${importInput.siblings('.bootstrap-filestyle').children('input').val()}`);
              $('#importExportMongoclientModal').modal('hide');
            }
          }
        });
      }, true);
    }
  },

  prepareImportModal() {
    const icon = $('#importExportMongoclientIcon');
    $('#importExportMongoclientTitle').text('Import Mongoclient Data');
    icon.addClass('fa-download');
    icon.removeClass('fa-upload');
    $('#btnProceedImportExport').text('Import');
    $('#frmImportMongoclient').show();
    $('#frmExportMongoclient').hide();
    $('#importExportMongoclientModal').modal('show');
  }
};

export default new MongoclientData();
