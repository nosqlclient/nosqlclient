import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import "./shell_histories.html";

const Ladda = require('ladda');

/**
 * Created by RSercan on 24.2.2016.
 */
/*global moment*/
Template.shellHistories.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    const selector = $('#tblShellHistories');
    selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        Helper.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
            Session.set(Helper.strSessionSelectedShellHistory, table.row(this).data());
            $('#btnUseHistoricalShellQuery').prop('disabled', false);
        }
    });
});

Template.shellHistories.events({
    'click #btnUseHistoricalShellQuery'  (e) {
        e.preventDefault();
        const history = Session.get(Helper.strSessionSelectedShellHistory);
        if (history) Helper.setCodeMirrorValue($('#divShellCommand'), history.command);
    }
});

export const initShellHistories = function () {
    Ladda.create(document.querySelector('#btnUseHistoricalShellQuery')).start();

    const tbl = $('#tblShellHistories');

    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblShellHistories')) {
        tbl.DataTable().destroy();
    }

    const history = JSON.parse(localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.SHELL_COMMAND_HISTORY) || "[]");
    tbl.DataTable({
        responsive: true,
        lengthMenu: [5, 10, 20],
        data: history,
        autoWidth: false,
        columns: [
            {
                data: "command",
                width: "80%"
            },
            {
                data: "date",
                width: "20%",
                render: function (cellData) {
                    return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        ]
    });

    Ladda.stopAll();
};