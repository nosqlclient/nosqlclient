import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {QueryHistory} from "/lib/imports/collections/query_history";
import "./query_histories.html";

const Ladda = require('ladda');

/**
 * Created by RSercan on 24.2.2016.
 */
/*global moment*/
Template.queryHistories.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    const selector = $('#tblQueryHistories');
    selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        Helper.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
            const selectedId = table.row(this).data()._id;
            Session.set(Helper.strSessionSelectedQueryHistory, QueryHistory.findOne({_id: selectedId}));
            $('#btnExecuteAgain').prop('disabled', false);
        }
    });
});

Template.queryHistories.events({
    'click #btnExecuteAgain'  (e) {
        e.preventDefault();
        const history = Session.get(Helper.strSessionSelectedQueryHistory);
        if (history) {
            Template[history.queryName].executeQuery(JSON.parse(history.params));
        }
    }
});

export const initQueryHistories = function () {
    // loading button

    Ladda.create(document.querySelector('#btnExecuteAgain')).start();

    const connectionId = Session.get(Helper.strSessionConnection);
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    const tblQueryHistories = $('#tblQueryHistories');

    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblQueryHistories')) {
        tblQueryHistories.DataTable().destroy();
    }

    const queryHistories = QueryHistory.find(
        {
            connectionId: connectionId,
            collectionName: selectedCollection
        },
        {
            sort: {date: -1}
        }).fetch();


    tblQueryHistories.DataTable({
        lengthMenu: [3, 5, 10, 20],
        data: queryHistories,
        autoWidth: false,
        columns: [
            {
                data: "queryName",
                "width": "20%"
            },
            {
                data: "date",
                "width": "20%",
                render: function (cellData) {
                    return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            {
                data: "params",
                "width": "60%",
                render: function (cellData) {
                    return JSON.stringify(cellData).replace(/\\"/g, '');
                }
            }
        ]
    });

    Ladda.stopAll();
};