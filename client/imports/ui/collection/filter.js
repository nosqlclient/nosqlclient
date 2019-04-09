import { ReactiveVar } from 'meteor/reactive-var';
import { UIComponents, SessionManager } from '/client/imports/modules';
import $ from 'jquery';

const CollectionFilter = function () {
  this.filterRegex = new ReactiveVar('');
  this.excludedCollectionsByFilter = new ReactiveVar([]);
};

CollectionFilter.prototype = {
  isFiltered() {
    return !!this.filterRegex.get() || this.excludedCollectionsByFilter.get().length !== 0;
  },

  applyFilter() {
    this.filterRegex.set(($('#inputFilterRegex').val()));

    const arr = [];
    $('#tblCollectionFilter').DataTable().$('input[type="checkbox"]').each(function () {
      if (!this.checked) arr.push(this.name);
    });

    this.excludedCollectionsByFilter.set(arr);
    $('#collectionFilterModal').modal('hide');
  },

  initializeFilterTable() {
    const self = this;
    const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
    collectionNames.forEach((obj) => {
      if (!obj.type) obj.type = 'collection';
    });

    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblCollectionFilter',
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
            if ($.inArray(data.name, self.excludedCollectionsByFilter.get()) === -1) return `<input name="${data.name}" type="checkbox" checked="checked"/>`;

            return `<input name="${data.name}" type="checkbox"/>`;
          },
        },
      ]
    });

    $('#inputFilterRegex').val(this.filterRegex.get());
  }
};

export default new CollectionFilter();
