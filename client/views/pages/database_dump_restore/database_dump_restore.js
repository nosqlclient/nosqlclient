import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import {Settings} from '/lib/collections/settings';
import {Dumps} from '/lib/collections/dumps';
import Enums from '/lib/enums';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 17.1.2016.
 */
Template.databaseDumpRestore.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Helper.initiateDatatable($('#tblDumps'), Helper.strSessionSelectedDump);
    populateDatatable();
});

Template.databaseDumpRestore.events({
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

const populateDatatable = function () {
    var tblDumps = $('#tblDumps');

    tblDumps.DataTable({
        destroy: true,
        data: Dumps.find({}, {sort: {date: -1}}).fetch(),
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
};
