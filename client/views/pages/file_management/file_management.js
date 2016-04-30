/**
 * Created by sercan on 09.02.2016.
 */
Template.fileManagement.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.fileManagement.initFileInformations();
    Template.initiateDatatable($('#tblFiles'),Template.strSessionSelectedFile);
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
        e.preventDefault();
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
                    Meteor.call('deleteFile', Session.get(Template.strSessionConnection), $('#txtBucketName').val(), fileRow._id, function (err) {
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
            Meteor.call('getFile', Session.get(Template.strSessionConnection), $('#txtBucketName').val(), fileRow._id, function (err, result) {
                if(err || result.error){
                    Template.showMeteorFuncError(err, result, "Couldn't find file");
                }
                else{
                    jsonEditor.set(result.result);
                }
                Ladda.stopAll();
            });
        }
    }

});

Template.fileManagement.initFileInformations = function () {
    // loading button
    var l = $('#btnReloadFiles').ladda();
    l.ladda('start');

    Meteor.call('getFileInfos', Session.get(Template.strSessionConnection), $('#txtBucketName').val(), function (err, result) {
            if(err || result.error){
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
                        defaultContent: '<a href="" title="Show File Info" class="editor_show_metadata"><i class="fa fa-book text-navy"></i></a>'
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