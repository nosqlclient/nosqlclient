import { Notification, ErrorHandler } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';

const MongoclientData = function () {

};

MongoclientData.prototype = {
  proceedImportExport() {
    const importInput = $('#inputImportBackupFile');

    if (importInput.val()) {
      Notification.start('#btnProceedImportExport');
      Helper.loadFile(null, importInput, (val) => {
        Communicator.call({
          methodName: 'importMongoclient',
          args: { file: val },
          callback: (err) => {
            if (err) ErrorHandler.showMeteorFuncError(err);
            else {
              Notification.success('imported-successfully', null, { path: importInput.siblings('.bootstrap-filestyle').children('input').val() });
              $('#importExportMongoclientModal').modal('hide');
            }
          }
        });
      }, true);
    }
  },

  prepareImportModal() {
    const icon = $('#importExportMongoclientIcon');
    $('#importExportMongoclientTitle').text(Helper.translate({ key: 'import-mongoclient' }));
    icon.addClass('fa-download');
    icon.removeClass('fa-upload');
    $('#btnProceedImportExport').text(Helper.translate({ key: 'import' }));
    $('#frmImportMongoclient').show();
    $('#frmExportMongoclient').hide();
    $('#importExportMongoclientModal').modal('show');
  }
};

export default new MongoclientData();
