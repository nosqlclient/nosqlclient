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
        const contentType = $('#inputContentType').val();
        const blob = $('#inputFile')[0].files[0];
        let metaData = Helper.getCodeMirrorValue($('#divMetadata'));
        metaData = Helper.convertAndCheckJSON(metaData);
        if (metaData["ERROR"]) {
            toastr.error("Syntax error on metaData: " + metaData["ERROR"]);
            return;
        }

        const aliases = [];
        $("#selectAliases").find("option").each(function () {
            aliases.push($(this).val());
        });

        $('#fileInfoModal').modal('hide');
        proceedUploading(blob, contentType, metaData, aliases);
    }
});