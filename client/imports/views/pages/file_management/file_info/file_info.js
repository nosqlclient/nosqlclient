import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';
import {proceedUploading} from '../upload_file/upload_file';

import './file_info.html';

const toastr = require('toastr');
/**
 * Created by RSercan on 14.2.2016.
 */

Template.fileInfo.events({
    'click #btnAddAlias'(e)  {
        e.preventDefault();
        const input = $('#inputAlias');
        const inputVal = input.val();
        if (inputVal) {
            $('#selectAliases').append($('<option>', {
                value: inputVal,
                text: inputVal
            }));
            input.val('');
        }
    },

    'click #btnRemoveAlias' (e)  {
        e.preventDefault();
        $('#selectAliases').find('option:selected').remove();
    },

    'click #btnKeepUploading' (e)  {
        e.preventDefault();
        let metaData = Helper.getCodeMirrorValue($('#divMetadata'));
        metaData = Helper.convertAndCheckJSON(metaData);
        if (metaData["ERROR"]) {
            toastr.error("Syntax error on metaData: " + metaData["ERROR"]);
            return;
        }

        $('#fileInfoModal').modal('hide');
        Helper.warnDemoApp();
    }
});