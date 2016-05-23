/**
 * Created by sercan on 09.02.2016.
 */
Template.fileManagement.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.fileManagement.initFileInformations();
    Template.initiateDatatable($('#tblFiles'), Template.strSessionSelectedFile, true);
});

Template.fileManagement.events({
    'click #btnReloadFiles': function () {
        Template.fileManagement.initFileInformations();
    },

    'click .editor_download': function (e) {
        e.preventDefault();
        var fileRow = Session.get(Template.strSessionSelectedFile);
        if (fileRow) {
            window.open(Router.url('download', {
                fileId: fileRow._id,
                connectionId: Session.get(Template.strSessionConnection),
                bucketName: $('#txtBucketName').val(),
                fileName: fileRow.filename
            }));
        }
    },

    'click .editor_delete': function (e) {
        var fileRow = Session.get(Template.strSessionSelectedFile);
        if (fileRow) {
            swal({
                title: "Are you sure ?",
                text: "You can NOT recover this file afterwards, are you sure ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes!",
                cancelButtonText: "No"
            }, function (isConfirm) {
                if (isConfirm) {
                    var l = $('#btnReloadFiles').ladda();
                    l.ladda('start');
                    Meteor.call('deleteFile', $('#txtBucketName').val(), fileRow._id, function (err) {
                        if (err) {
                            toastr.error("Couldn't delete: " + err.message);
                        } else {
                            toastr.success('Successfuly deleted !');
                            Template.fileManagement.initFileInformations();
                        }
                    });
                }
            });
        }
    },

    'click #btnUpdateMetadata': function (e) {
        e.preventDefault();

        swal({
            title: "Are you sure ?",
            text: "Existing metadata will be overwritten, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {
                var l = $('#btnUpdateMetadata').ladda();
                l.ladda('start');
                var jsonEditor = $('#jsonEditorOfMetadata').data('jsoneditor');
                var setValue = jsonEditor.get();
                delete setValue._id;

                Meteor.call('updateOne', $('#txtBucketName').val() + '.files',
                    {'_id': Session.get(Template.strSessionSelectedFile)._id}, {"$set": setValue}, {}, true, true,
                    function (err, result) {
                        if (err) {
                            toastr.error("Couldn't update file info: " + err.message);
                        } else {
                            toastr.success('Successfully updated file information !');
                            Template.fileManagement.proceedShowingMetadata(Session.get(Template.strSessionSelectedFile)._id, jsonEditor);
                        }

                        Ladda.stopAll();
                    });
            }
        });
    },

    'click .editor_show_metadata': function (e) {
        e.preventDefault();
        var l = $('#btnClose').ladda();
        l.ladda('start');

        var fileRow = Session.get(Template.strSessionSelectedFile);
        if (fileRow) {
            var editorDiv = $('#jsonEditorOfMetadata');
            var jsonEditor = editorDiv.data('jsoneditor');
            if (!jsonEditor) {
                jsonEditor = new JSONEditor(document.getElementById('jsonEditorOfMetadata'), {
                    mode: 'tree',
                    modes: ['code', 'form', 'text', 'tree', 'view'],
                    search: true
                });

                editorDiv.data('jsoneditor', jsonEditor);
            }

            $('#metaDataModal').modal('show');
            Template.fileManagement.proceedShowingMetadata(fileRow._id, jsonEditor);
        }
    }

});

Template.fileManagement.proceedShowingMetadata = function (id, jsonEditor) {
    Meteor.call('getFile', $('#txtBucketName').val(), id, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't find file");
        }
        else {
            jsonEditor.set(result.result);
        }
        Ladda.stopAll();
    });
};

Template.fileManagement.initFileInformations = function () {
    // loading button
    var l = $('#btnReloadFiles').ladda();
    l.ladda('start');

    var selector = Template.selector.getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call('getFileInfos', $('#txtBucketName').val(), selector, function (err, result) {
            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't get file informations");
                return;
            }

            var tblFiles = $('#tblFiles');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblFiles')) {
                tblFiles.DataTable().destroy();
            }
            tblFiles.DataTable({
                data: result.result,
                columns: [
                    {data: "_id", "width": "15%"},
                    {data: "filename", "width": "20%"},
                    {data: "chunkSize", "width": "15%"},
                    {data: "uploadDate", "width": "15%"},
                    {data: "length", "width": "15%"}
                ],
                columnDefs: [
                    {
                        targets: [5],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Edit Metadata" class="editor_show_metadata"><i class="fa fa-book text-navy"></i></a>'
                    },
                    {
                        targets: [6],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Download" class="editor_download"><i class="fa fa-download text-navy"></i></a>'
                    },
                    {
                        targets: [7],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>'
                    }
                ]
            });

            Ladda.stopAll();
        }
    );
};