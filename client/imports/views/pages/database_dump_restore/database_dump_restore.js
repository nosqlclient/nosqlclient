import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {Connections} from "/lib/imports/collections/connections";
import {Settings} from "/lib/imports/collections/settings";
import {Dumps} from "/lib/imports/collections/dumps";
import Enums from "/lib/imports/enums";
import "./database_dump_restore.html";

require('bootstrap-filestyle');

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 17.1.2016.
 */
/*global moment*/
/*global swal*/
const initCollectionsForImport = function () {
    const cmb = $('#cmbImportCollection');
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    cmb.append($("<optgroup id='optCollections' label='Collections'></optgroup>"));
    const cmbGroup = cmb.find('#optCollections');

    const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    Meteor.call('listCollectionNames', connection.databaseName, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch collection names");
        }
        else {
            for (let i = 0; i < result.result.length; i++) {
                cmbGroup.append($("<option></option>")
                    .attr("value", result.result[i].name)
                    .text(result.result[i].name));
            }
        }

        cmb.chosen({
            create_option: true,
            allow_single_deselect: true,
            persistent_create_option: true,
            skip_no_results: true
        });

        cmb.trigger("chosen:updated");
    });
};

const populateDatatable = function () {
    Ladda.create(document.querySelector('#btnTakeDump')).start();

    const tblDumps = $('#tblDumps');
    if ($.fn.dataTable.isDataTable('#tblDumps')) {
        tblDumps.DataTable().destroy();
    }
    tblDumps.DataTable({
        responsive: true,
        destroy: true,
        data: Dumps.find().fetch(),
        columns: [
            {
                title: '_id',
                data: '_id',
                className: 'center',
                sClass: "hide_column"
            },
            {
                title: 'Connection name',
                data: 'connectionName',
                width: '20%',
                className: 'center'
            },
            {
                title: 'Date',
                data: 'date',
                width: '15%',
                render: function (cellData) {
                    return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
                },
                className: 'center'
            },
            {
                title: 'File Path',
                data: 'filePath',
                width: '30%',
                className: 'center'
            },
            {
                title: 'Size',
                data: 'sizeInBytes',
                width: '10%',
                render: function (cellData) {
                    let scale = 1;
                    let text = "Bytes";

                    const settings = Settings.findOne();
                    switch (settings.scale) {
                        case "MegaBytes":
                            scale = 1024 * 1024;
                            text = "MBs";
                            break;
                        case "KiloBytes":
                            scale = 1024;
                            text = "KBs";
                            break;
                        default:
                            scale = 1;
                            text = "Bytes";
                            break;
                    }

                    return isNaN(Number(cellData / scale).toFixed(2)) ? "0.00" : Number(cellData / scale).toFixed(2) + " " + text;
                },
                className: 'center'
            },
            {
                title: 'Import Status',
                data: 'status',
                width: '15%',
                className: 'center'
            },
            {
                title: 'Import',
                data: null,
                className: 'center',
                width: '10%',
                bSortable: false,
                defaultContent: '<a href="" title="Import" class="editor_import"><i class="fa fa-database text-navy"></i></a>'
            }
        ]
    }).draw();

    Ladda.stopAll();
};

Template.databaseDumpRestore.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    Helper.initiateDatatable($('#tblDumps'), Helper.strSessionSelectedDump);
    $(".filestyle").filestyle({});

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let dumps = this.subscribe('dumps');

    this.autorun(() => {
        if (settings.ready() && connections.ready() && dumps.ready()) {
            initCollectionsForImport();
            populateDatatable();
        }
    });
});

Template.databaseDumpRestore.events({
    'click #btnProceedMongoimport'(){
        const inputSelector = $('#inputImportJsonFile');
        let selectedCollection = $('#cmbImportCollection').val();
        let inputFile = inputSelector.siblings('.bootstrap-filestyle').children('input').val();
        if (!inputFile || inputSelector.get(0).files.length === 0) {
            toastr.info('Please select a file !');
            return;
        }

        if (!selectedCollection) {
            toastr.info('Please select a collection !');
            return;
        }

        Helper.warnDemoApp();
    },

    'change #inputImportJsonFile'() {
        const inputSelector = $('#inputImportJsonFile');
        const blob = inputSelector[0].files[0];
        const fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'click #btnRefreshDumps'(e){
        e.preventDefault();
        populateDatatable();

        toastr.success('Successfully refreshed !');
    },

    'click #btnTakeDump'(e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click .editor_import'(e) {
        e.preventDefault();
        if (Session.get(Helper.strSessionSelectedDump)) {
            swal({
                title: "Are you sure?",
                text: "All collections will be dropped, and restored !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, do it!",
                closeOnConfirm: true
            }, function () {
                Helper.warnDemoApp();
            });
        }
    }
});