import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import "./stored_functions.html";

const toastr = require('toastr');
const Ladda = require('ladda');

/*global swal*/
const init = function (isRefresh) {
    Ladda.create(document.querySelector('#btnAddNewStoredFunction')).start();

    Meteor.call("find", "system.js", {}, {}, false, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch stored functions");
        }
        else {
            const tblStoredFunctions = $('#tblStoredFunctions');
            if ($.fn.dataTable.isDataTable('#tblStoredFunctions')) {
                tblStoredFunctions.DataTable().destroy();
            }
            tblStoredFunctions.DataTable({
                responsive: true,
                data: result.result,
                columns: [
                    {data: "_id"},
                    {data: "value.$code", sClass: "hide_column"}
                ],
                columnDefs: [
                    {
                        targets: [2],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Show/Edit" class="editor_edit"><i class="fa fa-pencil text-navy"></i></a>'
                    },
                    {
                        targets: [3],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>'
                    }
                ]
            });
            if (isRefresh) {
                toastr.success('Successfully refreshed !');
            }
        }

        Ladda.stopAll();
    });
};

Template.storedFunctions.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let modal = $('#editStoredFunctionModal');
    modal.on('shown.bs.modal', function () {
        const divStoredFunction = $('#divStoredFunction');
        Helper.initializeCodeMirror(divStoredFunction, 'txtStoredFunction');
        if (modal.data('selected')) {
            const data = modal.data('selected');
            $('#storedFunctionModalTitle').html(data._id);
            $('#inputStoredFunctionName').val(data._id);
            Helper.setCodeMirrorValue(divStoredFunction, data.value.$code, $('#txtStoredFunction'))
        } else {
            $('#storedFunctionModalTitle').html('Add Stored Function');
            $('#inputStoredFunctionName').val('');
            Helper.setCodeMirrorValue(divStoredFunction, '', $('#txtStoredFunction'))
        }
    });

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            Helper.initiateDatatable($('#tblStoredFunctions'), Helper.strSessionSelectedStoredFunction, true);
            init();
        }
    });
});


Template.storedFunctions.events({
    'click #btnRefreshStoredFunctions'(){
        init(true);
    },

    'click #btnSaveStoredFunction'(){
        Helper.warnDemoApp();
    },

    'click #btnAddNewStoredFunction'(){
        const modal = $('#editStoredFunctionModal');
        modal.data('selected', null);
        modal.modal('show');
    },

    'click .editor_edit'(){
        const data = Session.get(Helper.strSessionSelectedStoredFunction);
        if (data) {
            const modal = $('#editStoredFunctionModal');
            modal.data('selected', data);
            modal.modal('show');
        }
    },

    'click .editor_delete'  (e) {
        e.preventDefault();
        const name = Session.get(Helper.strSessionSelectedStoredFunction)._id;
        if (name) {
            swal({
                title: "Are you sure ?",
                text: "You can NOT recover this function afterwards, are you sure ?",
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

});