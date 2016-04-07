/**
 * Created by sercan on 09.02.2016.
 */
Template.fileManagement.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.fileManagement.initFileInformations();

    var selector = $('#tblFiles');
    selector.find('tbody').on('click', 'tr', function () {
        var table = selector.DataTable();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            Session.set(Template.strSessionSelectedFile, table.row(this).data());
        }
    });
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
        Template.warnDemoApp();
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
            var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
            Meteor.call('getFile', connection, $('#txtBucketName').val(), fileRow._id, function (err, result) {
                if (err) {
                    toastr.error("Couldn't find: " + err.message);
                    Ladda.stopAll();
                    return;
                }
                if (result.error) {
                    toastr.error("Couldn't find: " + result.error.message);
                    Ladda.stopAll();
                    return;
                }
                jsonEditor.set(result.result);
                Ladda.stopAll();
            });
        }
    }

});

Template.fileManagement.initFileInformations = function () {
    // loading button
    var l = $('#btnReloadFiles').ladda();
    l.ladda('start');

    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    Meteor.call('getFileInfos', connection, $('#txtBucketName').val(), function (err, result) {
            if (err) {
                toastr.error("Couldn't get file informations: " + err.message);
                Ladda.stopAll();
                return;
            }
            if (result.error) {
                toastr.error("Couldn't get file informations: " + result.error.message);
                Ladda.stopAll();
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