/**
 * Created by sercan on 09.02.2016.
 */

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';

import './upload_file/upload_file';
import './file_info/file_info';

import './file_management.html';

var JSONEditor = require('jsoneditor');
var toastr = require('toastr');
var Ladda = require('ladda');

const proceedShowingMetadata = function (id, jsonEditor) {
    Meteor.call('getFile', $('#txtBucketName').val(), id, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't find file");
        }
        else {
            jsonEditor.set(result.result);
        }

        Ladda.stopAll();
    });
};

const convertObjectIdAndDateToString = function (arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]._id) {
            arr[i]._id = arr[i]._id.$oid;
        }

        if (arr[i].uploadDate) {
            arr[i].uploadDate = arr[i].uploadDate.$date;
        }
    }
};

export const initFilesInformation = function () {
    var l = Ladda.create(document.querySelector('#btnReloadFiles'));
    l.start();

    var selector = getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);

        Ladda.stopAll();
        return;
    }

    Meteor.call('getFileInfos', $('#txtBucketName').val(), selector, $('#txtFileFetchLimit').val(), function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't get file informations");
                return;
            }

            var tblFiles = $('#tblFiles');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblFiles')) {
                tblFiles.DataTable().destroy();
            }

            convertObjectIdAndDateToString(result.result);
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

Template.fileManagement.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            initFilesInformation();
            Helper.initiateDatatable($('#tblFiles'), Helper.strSessionSelectedFile, true);
        }
    });
});

Template.fileManagement.events({
    'click #btnReloadFiles'  () {
        initFilesInformation();
    },

    'click .editor_download'  (e) {
        e.preventDefault();
        var fileRow = Session.get(Helper.strSessionSelectedFile);
        if (fileRow) {
            window.open('download?fileId=' + fileRow._id + '&bucketName=' + $('#txtBucketName').val());
        }
    },

    'click .editor_delete'  (e) {
        e.preventDefault();
        var fileRow = Session.get(Helper.strSessionSelectedFile);
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

                    var l = Ladda.create(document.querySelector('#btnReloadFiles'));
                    l.start();
                    Meteor.call('deleteFile', $('#txtBucketName').val(), fileRow._id, function (err) {
                        if (err) {
                            toastr.error("Couldn't delete: " + err.message);
                        } else {
                            toastr.success('Successfuly deleted !');
                            initFilesInformation();
                        }
                    });
                }
            });
        }
    },

    'click #btnUpdateMetadata'  (e) {
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

                var l = Ladda.create(document.querySelector('#btnUpdateMetadata'));
                l.start();
                var jsonEditor = $('#jsonEditorOfMetadata').data('jsoneditor');
                var setValue = jsonEditor.get();
                delete setValue._id;

                Meteor.call('updateOne', $('#txtBucketName').val() + '.files',
                    {'_id': {"$oid": Session.get(Helper.strSessionSelectedFile)._id}}, {"$set": setValue}, {}, function (err) {
                        if (err) {
                            toastr.error("Couldn't update file info: " + err.message);
                        } else {
                            toastr.success('Successfully updated file information !');
                            proceedShowingMetadata(Session.get(Helper.strSessionSelectedFile)._id, jsonEditor);
                        }


                        Ladda.stopAll();
                    });
            }
        });
    },

    'click .editor_show_metadata' (e) {
        e.preventDefault();

        var l = Ladda.create(document.querySelector('#btnClose'));
        l.start();

        var fileRow = Session.get(Helper.strSessionSelectedFile);
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
            proceedShowingMetadata(fileRow._id, jsonEditor);
        }
    }

});