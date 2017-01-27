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
        if (!indexInfo.result.hasOwnProperty(obj)) {
            continue;
        }

        let index = {
            name: obj.name,
            asc_fields: "",
            desc_fields: "",
            sphere_fields: "",
            size: "",
            usage_count: 0,
            usage_since: "",
            partial: "",
            properties: ""
        };

        for (let field of obj.key) {
            if (obj.key[field] === 1) {
                index.asc_fields += field + ", ";
            } else if (obj.key[field] === -1) {
                index.desc_fields += field + ", ";
            } else if (obj.key[field] === "2dsphere") {
                index.sphere_fields += field + ", ";
            }
        }

        if (obj.background) {
            index.properties += "background, ";
        }

        //TODO


        for (let statObj of stats.result) {
        }

        result.push(index);
    }


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

                        initializeIndexesTable(data);
                        Ladda.stopAll();
                    });
                }
            });
        }

    });
};

const initializeIndexesTable = function (data) {
    let tblIndexes = $('#tblIndexes');
    if ($.fn.dataTable.isDataTable('#tblIndexes')) {
        tblIndexes.DataTable().destroy();
    }
    tblIndexes.DataTable({
        data: data,
        columns: [
            {data: "name"},
            {data: "asc_fields"},
            {data: "desc_fields"},
            {data: "sphere_fields"},
            {data: "size"},
            {data: "usage_count"},
            {data: "usage_since"},
            {data: "partial"},
            {data: "properties"}
        ],
        columnDefs: [
            {
                targets: [9],
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Delete" class="editor_remove"><i class="fa fa-remove text-navy"></i></a>'
            }
        ]
    });
};

Template.indexManagement.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    initializeIndexesTable([]);

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