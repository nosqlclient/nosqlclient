import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import "./index_management.html";
import {FlowRouter} from "meteor/kadira:flow-router";

const toastr = require('toastr');
const Ladda = require('ladda');

const populateTableData = function (indexInfo, stats, indexStats) {
    let result = [];
    for (let obj of indexInfo.result) {
        let index = {
            name: obj.name,
            asc_fields: [],
            desc_fields: [],
            sphere_fields: [],
            hashed: [],
            text: [],
            properties: ""
        };

        if (obj.weights) {
            index.text.push(Object.keys(obj.weights)[0]);
        }
        if (obj.background) {
            index.background = true;
        }
        if (obj.sparse) {
            index.sparse = true;
        }
        if (obj.unique) {
            index.unique = true;
        }
        if (obj.expireAfterSeconds) {
            index.ttl = obj.expireAfterSeconds + " seconds ";
        }
        if (obj.partialFilterExpression) {
            index.partial = obj.partialFilterExpression;
        }

        if (obj.key && Object.prototype.toString.call(obj.key) === '[object Object]') {
            for (let field in obj.key) {
                if (obj.key[field] === 1) {
                    index.asc_fields.push(field);
                } else if (obj.key[field] === -1) {
                    index.desc_fields.push(field);
                } else if (obj.key[field] === "2dsphere") {
                    index.sphere_fields.push(field);
                } else if (obj.key[field] === "hashed") {
                    index.hashed.push(field);
                }
            }
        }

        if (stats.result.indexSizes && stats.result.indexSizes[index.name]) {
            index.size = stats.result.indexSizes[index.name];
        }

        if (indexStats && indexStats.result) {
            for (let indexStat of indexStats.result) {
                if (indexStat.name === index.name) {
                    index.usage = indexStat.accesses.ops;
                    index.usage_since = indexStat.accesses.since.$date;
                }
            }
        }

        result.push(index);
    }

    return result;
};

const initIndexes = function () {
    Ladda.create(document.querySelector('#btnAddIndex')).start();
    const selectedCollection = $('#cmbCollections').val();

    Meteor.call("indexInformation", selectedCollection, true, function (err, indexInformation) {
        if (err || indexInformation.error) {
            Helper.showMeteorFuncError(err, indexInformation, "Couldn't fetch indexes");
            Ladda.stopAll();
        }
        else {
            Meteor.call("stats", selectedCollection, {}, function (statsErr, stats) {
                if (statsErr || stats.error) {
                    Helper.showMeteorFuncError(statsErr, stats, "Couldn't fetch indexes");
                    Ladda.stopAll();
                }
                else {
                    Meteor.call("aggregate", selectedCollection, [{$indexStats: {}}], {}, function (aggregateErr, indexStats) {
                        const data = populateTableData(indexInformation, stats, indexStats);

                        console.log(data);
                        initializeIndexesTable(data);
                        Ladda.stopAll();
                    });
                }
            });
        }

    });
};

const initializeIndexesTable = function (data) {
    const tblIndexes = $('#tblIndexes');
    const tbody = tblIndexes.find('tbody');

    for (let index of data) {
        let row = '<tr><td>';
        for (let field of index.asc_fields) {
            row += "<button class='btn btn-info btn-xs'> " + field + "</button>"
        }
        for (let field of index.desc_fields) {
            row += "<button class='btn btn-success btn-xs'> " + field + "</button>"
        }
        for (let field of index.hashed) {
            row += "<button class='btn btn-warning btn-xs'> " + field + "</button>"
        }
        for (let field of index.sphere_fields) {
            row += "<button class='btn btn-info btn-xs'> " + field + "</button>"
        }
        for (let field of index.text) {
            row += "<button class='btn btn-warning btn-xs'> " + field + "</button>"
        }

        row += "</td></tr>";
        tbody.append(row);
    }
};

Template.indexManagement.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            Helper.initiateDatatable($('#tblIndexes'), Helper.strSessionSelectedIndex);
            Helper.initializeCollectionsCombobox();
        }
    });
});

Template.indexManagement.events({
    'click #btnAddIndex' (){
        if (!$('#cmbCollections').val()) {
            toastr.warning('Please select a collection first !');
            return;
        }

        //TODO
    },

    'change #cmbCollections'(){
        if ($('#cmbCollections').val()) {
            initIndexes();
        }
    },

    'click .editor_remove'  (e) {
        e.preventDefault();

        let laddaButton = Ladda.create(document.querySelector('#btnAddIndex'));
        laddaButton.start();

        $('#tblIndexes').DataTable().$('tr.selected').removeClass('selected');

        const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
        const indexName = Session.get(Helper.strSessionSelectedIndex);

        Meteor.call("dropIndex", selectedCollection, indexName, function (err, result) {
            if (err || result.err) {
                Helper.showMeteorFuncError(err, result, "Couldn't drop index");
            } else {
                toastr.error("Successfully dropped index: " + indexName);
            }

            Ladda.stopAll();
        });

    },
});