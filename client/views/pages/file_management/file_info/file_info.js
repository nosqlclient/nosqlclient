var toastr = require('toastr');
/**
 * Created by RSercan on 14.2.2016.
 */
Template.fileInfo.onRendered(function () {
    Template.initializeAceEditor('aceMetaData', 'null');
});

Template.fileInfo.events({
    'click #btnAddAlias': function (e) {
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

    'click #btnRemoveAlias': function (e) {
        e.preventDefault();
        $('#selectAliases').find('option:selected').remove();
    },

    'click #btnKeepUploading': function (e) {
        e.preventDefault();
        var contentType = $('#inputContentType').val();
        var blob = $('#inputFile')[0].files[0];
        var metaData = ace.edit("aceMetaData").getSession().getValue();
        metaData = Template.convertAndCheckJSON(metaData);
        if (metaData["ERROR"]) {
            toastr.error("Syntax error on metaData: " + metaData["ERROR"]);
            return;
        }

        var aliases = [];
        $("#selectAliases").find("option").each(function () {
            aliases.push($(this).val());
        });

        $('#fileInfoModal').modal('hide');
        Template.uploadFile.proceedUploading(blob, contentType, metaData, aliases);
    }
});