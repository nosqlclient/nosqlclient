import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import "./index_management.html";
import {FlowRouter} from "meteor/kadira:flow-router";
import {prepareFormForView} from "./add_index/add_index";
import {initialize} from "./view_raw/view_raw";
import {Settings} from "/lib/imports/collections/settings";

/*global moment*/
/*global swal*/

const toastr = require('toastr');
const Ladda = require('ladda');

export const initIndexes = function () {
    const selectedCollection = $('#cmbCollections').val();
    if (!selectedCollection) {
        return;
    }

    Ladda.create(document.querySelector('#btnAddIndex')).start();
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

const getCorrectSize = function (size) {
    if (!size) {
        return "";
    }

    const settings = Settings.findOne();
    let scale = 1;
    let text = "Bytes";
    switch (settings.scale) {
        case "MegaBytes":
            scale = 1024 * 1024;
            text = "MB";
            break;
        case "KiloBytes":
            scale = 1024;
            text = "KB";
            break;
        default:
            scale = 1;
            text = "Bytes";
            break;
    }
    return isNaN(Number(size / scale).toFixed(2)) ? "0 " + text : Number(size / scale).toFixed(2) + " " + text;
};

const populateTableData = function (indexInfo, stats, indexStats) {
    let result = [];
    for (let obj of indexInfo.result) {
        let index = {
            name: obj.name,
            asc_fields: [],
            desc_fields: [],
            sphere_fields: [],
            geo_haystack_fields: [],
            twod_fields: [],
            hashed: [],
            text: [],
            properties: []
        };

        if (obj.weights) {
            index.text.push(Object.keys(obj.weights)[0]);
        }
        if (obj.background) {
            index.properties.push("background");
        }
        if (obj.sparse) {
            index.properties.push("sparse");
        }
        if (obj.unique) {
            index.properties.push("unique");
        }
        if (obj.expireAfterSeconds) {
            index.properties.push("ttl " + obj.expireAfterSeconds);
        }
        if (obj.partialFilterExpression) {
            index.properties.push("partial");
            index.partial = obj.partialFilterExpression;
        }

        if (obj.key && Object.prototype.toString.call(obj.key) === '[object Object]') {
            for (let field in obj.key) {
                if (field === '_fts' || field === '_ftsx') {
                    continue;
                }
                if (obj.key[field] === 1) {
                    index.asc_fields.push(field);
                } else if (obj.key[field] === -1) {
                    index.desc_fields.push(field);
                } else if (obj.key[field] === "2dsphere") {
                    index.sphere_fields.push(field);
                } else if (obj.key[field] === "2d") {
                    index.twod_fields.push(field);
                } else if (obj.key[field] === "geoHaystack") {
                    index.geo_haystack_fields.push(field);
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

const initializeIndexesTable = function (data) {
    const tblIndexes = $('#tblIndexes');
    const tbody = tblIndexes.find('tbody');
    tbody.html("");

    for (let index of data) {
        let row = '<tr><td>';

        //start of fields
        for (let field of index.asc_fields) {
            row += "<button class='btn btn-white btn-xs'>" + field + "</button>  "
        }
        for (let field of index.desc_fields) {
            row += "<button class='btn btn-danger btn-xs'>" + field + "</button>  "
        }
        for (let field of index.hashed) {
            row += "<button class='btn btn-warning btn-xs'>" + field + "</button>  "
        }
        for (let field of index.sphere_fields) {
            row += "<button class='btn btn-info btn-xs'>" + field + "</button>  "
        }
        for (let field of index.twod_fields) {
            row += "<button class='btn btn-primary btn-xs'>" + field + "</button>  "
        }
        for (let field of index.geo_haystack_fields) {
            row += "<button class='btn index-button btn-xs'>" + field + "</button>  "
        }
        for (let field of index.text) {
            row += "<button class='btn btn-success btn-xs'>" + field + "</button>  "
        }
        row += "</td>";

        // start of index name/info
        row += "<td class='issue-info'><a href='#'>" + index.name + "</a><small>";
        if (index.usage) {
            row += "Usage count: <b>" + index.usage + "</b>, since: <b>" + moment(index.usage_since).format('MMMM Do YYYY, h:mm:ss a') + "</b>";
        }
        row += "</small></td>";

        // start of size
        row += "<td>" + getCorrectSize(index.size) + "</td>";

        // start of properties
        row += "<td>";
        for (let property of index.properties) {
            row += "<button class='btn btn-white btn-xs'>" + property + "</button>  "
        }
        row += "</td>";

        row += "<td><a href='' title='Show Details' id='" + index.name + "' class='editor_view'><i class='fa fa-book text-navy'></i></a>";
        row += "<td><a href='' title='Show Raw Json' id='" + index.name + "' class='editor_raw'><i class='fa fa-leaf text-navy'></i></a>";
        row += "</td><td><a href='' title='Drop' id='" + index.name + "' class='editor_remove'><i class='fa fa-remove text-navy'></i></a></td></tr>";
        tbody.append(row);
    }
};

Template.indexManagement.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    $('#addIndexModal').on('shown.bs.modal', function () {
        prepareFormForView();
    });
    $('#viewRawModal').on('shown.bs.modal', function () {
        initialize();
    });

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            Helper.initializeCollectionsCombobox();
            $('#divUnique, #divBackground').iCheck({
                checkboxClass: 'icheckbox_square-green'
            });
        }
    });
});

Template.indexManagement.events({
    'click #btnAddIndex' (){
        if (!$('#cmbCollections').val()) {
            toastr.warning('Please select a collection first !');
            return;
        }

        const addIndexModal = $('#addIndexModal');
        addIndexModal.data('collection', '');
        addIndexModal.data('index', '');
        addIndexModal.modal('show');
    },

    'click .editor_raw'(e){
        const rawModal = $('#viewRawModal');
        rawModal.data('collection', $('#cmbCollections').val());
        rawModal.data('index', e.currentTarget.id);
        rawModal.modal('show');
    },

    'click #btnRefreshIndexes'(){
        initIndexes();
    },

    'change #cmbCollections'(){
        initIndexes();
    },

    'click .editor_view'(e){
        const addIndexModal = $('#addIndexModal');
        addIndexModal.data('collection', $('#cmbCollections').val());
        addIndexModal.data('index', e.currentTarget.id);
        addIndexModal.modal('show');
    },

    'click .editor_remove'  (e) {
        e.preventDefault();
        const selectedCollection = $('#cmbCollections').val();
        const indexName = e.currentTarget.id;

        if (indexName && selectedCollection) {
            swal({
                title: "Are you sure ?",
                text: indexName + " will be dropped, are you sure ?",
                type: "info",
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