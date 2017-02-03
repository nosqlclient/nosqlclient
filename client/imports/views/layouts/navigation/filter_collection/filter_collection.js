import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import "./filter_collection.html";
import {excludedCollectionsByFilter, filterRegex} from "../navigation";

const toastr = require('toastr');

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('bootstrap-filestyle');

export const initializeFilterTable = function () {
    let collectionNames = Session.get(Helper.strSessionCollectionNames);

    let selector = $('#tblCollectionFilter');
    if ($.fn.dataTable.isDataTable('#tblCollectionFilter')) {
        selector.DataTable().destroy();
    }

    selector.DataTable({
        data: collectionNames,
        columns: [
            {data: "name"}
        ],
        columnDefs: [
            {
                targets: [1],
                data: null,
                width: "10%",
                render: function (data) {
                    if ($.inArray(data.name, excludedCollectionsByFilter) === -1) {
                        return '<input type="checkbox" checked>';
                    }

                    return '<input type="checkbox">';
                }
            }
        ]
    });

    $('#inputFilterRegex').val(filterRegex);
};

Template.filterCollection.events({
    'click #btnApplyFilter'(){
        const tableData = $('#tblCollectionFilter').DataTable().rows().data();
        console.log(tableData);
        //TODO
    }
});