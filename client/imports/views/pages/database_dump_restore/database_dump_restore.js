import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {Connections} from '/lib/imports/collections/connections';
import {Settings} from '/lib/imports/collections/settings';
import {Dumps} from '/lib/imports/collections/dumps';
import Enums from '/lib/imports/enums';

import './database_dump_restore.html';

require('bootstrap-filestyle');

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 17.1.2016.
 */

const initCollectionsForImport = function () {
    var cmb = $('#cmbImportCollection');
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    cmb.append($("<optgroup id='optCollections' label='Collections'></optgroup>"));
    var cmbGroup = cmb.find('#optCollections');

    var connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});


    Meteor.call('listCollectionNames', connection.databaseName, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch collection names");
        }
        else {
            for (var i = 0; i < result.result.length; i++) {
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
    var laddaButton = Ladda.create(document.querySelector('#btnTakeDump'));
    laddaButton.start();

    var tblDumps = $('#tblDumps');
    if ($.fn.dataTable.isDataTable('#tblDumps')) {
        tblDumps.DataTable().destroy();
    }
    tblDumps.DataTable({
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
                    var scale = 1;
                    var text = "Bytes";

                    var settings = Settings.findOne();
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

                    var result = isNaN(Number(cellData / scale).toFixed(2)) ? "0.00" : Number(cellData / scale).toFixed(2);
                    return result + " " + text;
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
        Router.go('databaseStats');
        return;
    }

    Helper.initiateDatatable($('#tblDumps'), Helper.strSessionSelectedDump);
    $(".filestyle").filestyle({});
    initCollectionsForImport();
    populateDatatable();
});

Template.databaseDumpRestore.events({
    'click #btnProceedMongoimport'(){
        var inputSelector = $('#inputImportJsonFile');
        var selectedCollection = $('#cmbImportCollection').val();
        var inputFile = inputSelector.siblings('.bootstrap-filestyle').children('input').val();
        if (!inputFile || inputSelector.get(0).files.length === 0) {
            toastr.info('Please select a file !');
            return;
        }

        if (!selectedCollection) {
            toastr.info('Please select a collection !');
            return;
        }

        var laddaButton = Ladda.create(document.querySelector('#btnProceedMongoimport'));
        laddaButton.start();

        var fileReader = new FileReader();
        fileReader.onload = function (file) {
            let fileContent = new Uint8Array(file.target.result);
            Meteor.call('mongoimport', fileContent, selectedCollection, function (err, result) {
                if (err || result.error) {
                    Helper.showMeteorFuncError(err, result, "Couldn't import data");
                }
                else {
                    toastr.success('Successfully imported extended json file !');
                }

                Ladda.stopAll();
            });
        };
        fileReader.readAsArrayBuffer(inputSelector[0].files[0]);
    },

    'change #inputImportJsonFile'() {
        var inputSelector = $('#inputImportJsonFile');
        var blob = inputSelector[0].files[0];
        var fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

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
        var settings = Settings.findOne();

        var laddaButton = Ladda.create(document.querySelector('#btnTakeDump'));
        laddaButton.start();

        Meteor.call('takeDump', Session.get(Helper.strSessionConnection), settings.dumpPath, function (err) {
            if (err) {
                toastr.error("Couldn't take dump, " + err.message);
            }
            else {
                toastr.success('A background process to take a dump has started, whenever it finishes you can see the dump on this page');
            }

            Ladda.stopAll();
        });
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

                var laddaButton = Ladda.create(document.querySelector('#btnTakeDump'));
                laddaButton.start();

                var dumpInfo = Session.get(Helper.strSessionSelectedDump);
                dumpInfo.status = Enums.DUMP_STATUS.IN_PROGRESS;
                Meteor.call('updateDump', dumpInfo); // this is a simple update to notify user on UI
                Meteor.call('restoreDump', Session.get(Helper.strSessionConnection), dumpInfo, function (err) {
                    if (err) {
                        toastr.error("Couldn't restore dump, " + err.message);
                    }
                    else {
                        toastr.success('A background process to restore the dump(' + dumpInfo.filePath + ') has started, whenever it finishes you can see the result on this page');
                    }

                    Ladda.stopAll();
                });
            });
        }
    }
});