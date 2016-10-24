import {Template} from 'meteor/templating';
import Helper from '/client/helper';
import {proceedUploading} from '../upload_file/upload_file';

var toastr = require('toastr');
/**
 * Created by RSercan on 14.2.2016.
 */

Template.fileInfo.events({
    'click #btnAddAlias'(e)  {
        e.preventDefault();
        var input = $('#inputAlias');
        var inputVal = input.val();
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
        var contentType = $('#inputContentType').val();
        var blob = $('#inputFile')[0].files[0];
        var metaData = Helper.getCodeMirrorValue($('#divMetadata'));
        metaData = Helper.convertAndCheckJSON(metaData);
        if (metaData["ERROR"]) {
            toastr.error("Syntax error on metaData: " + metaData["ERROR"]);
            return;
        }

        var aliases = [];
        $("#selectAliases").find("option").each(function () {
            aliases.push($(this).val());
        });

        $('#fileInfoModal').modal('hide');
        proceedUploading(blob, contentType, metaData, aliases);
    }
});