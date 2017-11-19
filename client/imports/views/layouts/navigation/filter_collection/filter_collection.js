import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helpers/helper';
import './filter_collection.html';
import { excludedCollectionsByFilter, filterRegex, setExcludedCollectionsByFilter, setFilterRegex } from '../navigation';
import $ from 'jquery';

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('bootstrap-filestyle');

export const initializeFilterTable = function () {
  const collectionNames = Session.get(Helper.strSessionCollectionNames);

  const selector = $('#tblCollectionFilter');
  if ($.fn.dataTable.isDataTable('#tblCollectionFilter')) {
    selector.DataTable().destroy();
  }

  for (const obj of collectionNames) {
    if (!obj.type) {
      obj.type = 'collection';
    }
  }

  selector.DataTable({
    responsive: true,
    data: collectionNames,
    columns: [
      { data: 'name' },
      { data: 'type' },
    ],
    columnDefs: [
      {
        targets: [2],
        data: null,
        width: '10%',
        render(data) {
          if ($.inArray(data.name, excludedCollectionsByFilter.get()) === -1) {
            return `<input name="${data.name}" type="checkbox" checked="checked">`;
          }

          return `<input name="${data.name}" type="checkbox">`;
        },
      },
    ],
  });

  $('#inputFilterRegex').val(filterRegex.get());
};

Template.filterCollection.events({
  'click #btnApplyFilter': function () {
    setFilterRegex($('#inputFilterRegex').val());

    const arr = [];
    $('#tblCollectionFilter').DataTable().$('input[type="checkbox"]').each(function () {
      if (!this.checked) {
        arr.push(this.name);
      }
    });

    setExcludedCollectionsByFilter(arr);
    $('#collectionFilterModal').modal('hide');
  },
});
