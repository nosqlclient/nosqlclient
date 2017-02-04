import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import "./filter_collection.html";
import {excludedCollectionsByFilter, filterRegex, setExcludedCollectionsByFilter, setFilterRegex} from "../navigation";

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
                    if ($.inArray(data.name, excludedCollectionsByFilter.get()) === -1) {
                        return '<input name="' + data.name + '" type="checkbox" checked="checked">';
                    }

                    return '<input name="' + data.name + '" type="checkbox">';
                }
            }
        ]
    });

    $('#inputFilterRegex').val(filterRegex.get());
};

Template.filterCollection.events({
    'click #btnApplyFilter'(){
        setFilterRegex($('#inputFilterRegex').val());

        let arr = [];
        $('#tblCollectionFilter').DataTable().$('input[type="checkbox"]').each(function () {
            if (!this.checked) {
                arr.push(this.name);
            }
        });

        setExcludedCollectionsByFilter(arr);
        $('#collectionFilterModal').modal('hide');
    }
});