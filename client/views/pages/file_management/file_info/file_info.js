/**
 * Created by RSercan on 14.2.2016.
 */
Template.fileInfo.onRendered(function () {
    Tracker.autorun(function (e) {
        var editor = AceEditor.instance('aceMetaData', {
            mode: "javascript",
            theme: 'dawn'
        });
        if (editor.loaded !== undefined) {
            e.stop();
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                fontSize: "11pt",
                showPrintMargin: false
            });

            // remove newlines in pasted text
            editor.on("paste", function (e) {
                e.text = e.text.replace(/[\r\n]+/g, " ");
            });
            // make mouse position clipping nicer
            editor.renderer.screenToTextCoordinates = function (x, y) {
                var pos = this.pixelToScreenCoordinates(x, y);
                return this.session.screenToDocumentPosition(
                    Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
                    Math.max(pos.column, 0)
                );
            };
            // disable Enter Shift-Enter keys
            editor.commands.bindKey("Enter|Shift-Enter", "null");
        }
    });
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