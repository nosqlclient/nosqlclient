/**
 * Created by sercan on 02.12.2016.
 */
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import SchemaAnalyzeResult from "/lib/imports/collections/schema_analyze_result";
import "./schema_analyzer.html";

const toastr = require('toastr');
const Ladda = require('ladda');

const ensureFieldsDataForDatatable = function (data) {
    for (let i = 0; i < data.length; i++) {
        if (!data[i].value.types.String) {
            data[i].value.types.String = "";
        }
        if (!data[i].value.types.Number) {
            data[i].value.types.Number = "";
        }
        if (!data[i].value.types.Array) {
            data[i].value.types.Array = "";
        }
        if (!data[i].value.types.null) {
            data[i].value.types.null = "";
        }
        if (!data[i].value.types.Date) {
            data[i].value.types.Date = "";
        }
        if (!data[i].value.types.NumberLong) {
            data[i].value.types.NumberLong = "";
        }
        if (!data[i].value.types.ObjectId) {
            data[i].value.types.ObjectId = "";
        }
        if (!data[i].value.types.Object) {
            data[i].value.types.Object = "";
        }
        if (!data[i].value.types.Boolean) {
            data[i].value.types.Boolean = "";
        }
    }
};

const populateFieldsTable = function (data) {
    const tblFields = $('#tblFieldsDetails');
    if ($.fn.dataTable.isDataTable('#tblFieldsDetails')) {
        tblFields.DataTable().destroy();
    }

    ensureFieldsDataForDatatable(data);
    tblFields.DataTable({
        responsive: true,
        destroy: true,
        data: data,
        columns: [
            {
                title: 'Field Name',
                data: '_id.key',
                className: 'center'
            },
            {
                title: 'Total Occurrences',
                data: 'totalOccurrences',
                className: 'center'
            },
            {
                title: 'Percentage Containing',
                data: 'percentContaining',
                className: 'center'
            },
            {
                title: 'String',
                data: 'value.types.String',
                className: 'center'
            },
            {
                title: 'Number',
                data: 'value.types.Number',
                className: 'center'
            },
            {
                title: 'Boolean',
                data: 'value.types.Boolean',
                className: 'center'
            },
            {
                title: 'Array',
                data: 'value.types.Array',
                className: 'center'
            },
            {
                title: 'Null',
                data: 'value.types.null',
                className: 'center'
            },
            {
                title: 'Date',
                data: 'value.types.Date',
                className: 'center'
            },
            {
                title: 'NumberLong',
                data: 'value.types.NumberLong',
                className: 'center'
            },
            {
                title: 'ObjectId',
                data: 'value.types.ObjectId',
                className: 'center'
            },
            {
                title: 'Object',
                data: 'value.types.Object',
                className: 'center'
            }
        ]
    }).draw();
};

Template.schemaAnalyzer.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let schemaAnalyzeResult = this.subscribe('schema_analyze_result');

    this.autorun(() => {
        if (connections.ready() && settings.ready() && schemaAnalyzeResult.ready()) {
            Helper.initializeCollectionsCombobox();

            SchemaAnalyzeResult.find({
                connectionId: Session.get(Helper.strSessionConnection),
                sessionId: Meteor.default_connection._lastSessionId
            }, {sort: {date: -1}}).observeChanges({
                added: function (id, fields) {
                    let jsonData = Helper.convertAndCheckJSON(fields.message);
                    if (jsonData['ERROR']) {
                        toastr.error(fields.message);
                        Meteor.call("removeSchemaAnalyzeResult", Meteor.default_connection._lastSessionId);
                        Ladda.stopAll();
                        return;
                    }

                    Ladda.create(document.querySelector('#btnAnalyzeNow')).start();
                    populateFieldsTable(jsonData);
                    $('#divFieldsDetails').show();

                    Ladda.stopAll();
                }
            });
        }
    });
});

Template.schemaAnalyzer.onDestroyed(function () {
    Meteor.call("removeSchemaAnalyzeResult", Meteor.default_connection._lastSessionId);
});

Template.schemaAnalyzer.events({
    'click #btnAnalyzeNow': function () {
        let collection = $('#cmbCollections').val();
        if (!collection) {
            toastr.info('Please select a collection first !');
            return;
        }
        if (collection.endsWith('.chunks')) {
            toastr.warning('I rather not analyzing a GridFS collection !');
            return;
        }

        Ladda.create(document.querySelector('#btnAnalyzeNow')).start();

        Meteor.call("analyzeSchema", Session.get(Helper.strSessionConnection), collection, Meteor.default_connection._lastSessionId, (err) => {
            if (err) {
                Helper.showMeteorFuncError(err, null, "Couldn't analyze collection");
            }
        });
    }

});