/**
 * Created by sercan on 09.02.2016.
 */
/*global swal*/
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {getSelectorValue} from "/client/imports/views/query_templates_options/selector/selector";
import "./upload_file/upload_file";
import "./file_info/file_info";
import "./file_management.html";

const JSONEditor = require('jsoneditor');
const toastr = require('toastr');
const Ladda = require('ladda');

const proceedShowingMetadata = function (id, jsonEditor) {
    Meteor.call('getFile', $('#txtBucketName').val(), id, Meteor.default_connection._lastSessionId, function (err, result) {
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
    Ladda.create(document.querySelector('#btnReloadFiles')).start();

    let selector = getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call('getFileInfos', $('#txtBucketName').val(), selector, $('#txtFileFetchLimit').val(), Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't get file informations");
                return;
            }

            const tblFiles = $('#tblFiles');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblFiles')) {
                tblFiles.DataTable().destroy();
            }

            convertObjectIdAndDateToString(result.result);
            tblFiles.DataTable({
                responsive: true,
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
    'click #btnDeleteFiles' (){
        swal({
            title: "Are you sure ?",
            text: "All files that are matched by selector will be deleted, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
        }, function (isConfirm) {
            if (isConfirm) {
                Helper.warnDemoApp();
            }
        });
    },

    'click #btnReloadFiles'  () {
        initFilesInformation();
    },

    'click .editor_download'  (e) {
        e.preventDefault();
        const fileRow = Session.get(Helper.strSessionSelectedFile);
        if (fileRow) {
            window.open('download?fileId=' + fileRow._id + '&bucketName=' + $('#txtBucketName').val() + '&sessionId=' + Meteor.default_connection._lastSessionId);
        }
    },

    'click .editor_delete'  (e) {
        e.preventDefault();
        const fileRow = Session.get(Helper.strSessionSelectedFile);
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
                    Helper.warnDemoApp();
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
                Helper.warnDemoApp();
            }
        });
    },

    'click .editor_show_metadata' (e) {
        e.preventDefault();

        Ladda.create(document.querySelector('#btnClose')).start();

        const fileRow = Session.get(Helper.strSessionSelectedFile);
        if (fileRow) {
            const editorDiv = $('#jsonEditorOfMetadata');
            let jsonEditor = editorDiv.data('jsoneditor');
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