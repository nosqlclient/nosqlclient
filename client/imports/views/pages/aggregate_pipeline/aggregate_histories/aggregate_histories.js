import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { renderQuery } from '../aggregate_pipeline';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import './aggregate_histories.html';

const Ladda = require('ladda');

/**
 * Created by RSercan on 24.2.2016.
 */
/* global moment */
Template.aggregateHistories.onRendered(() => {
  if (Session.get(Helper.strSessionCollectionNames) == undefined) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const selector = $('#tblAggregateHistories');
  selector.find('tbody').on('click', 'tr', function () {
    const table = selector.DataTable();
    Helper.doTableRowSelectable(table, $(this));

    if (table.row(this).data()) {
      Session.set(Helper.strSessionSelectedAggregateHistory, table.row(this).data());
      $('#btnUseHistoricalPipeline').prop('disabled', false);
    }
  });
});

Template.aggregateHistories.events({
  'click #btnUseHistoricalPipeline': function (e) {
    e.preventDefault();
    const history = Session.get(Helper.strSessionSelectedAggregateHistory);
    if (history) renderQuery({ queryInfo: history.collection, queryParams: history.pipeline });
  },
});

export const initAggregateHistories = function () {
  Ladda.create(document.querySelector('#btnUseHistoricalPipeline')).start();

  const tbl = $('#tblAggregateHistories');

  // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
  if ($.fn.dataTable.isDataTable('#tblAggregateHistories')) {
    tbl.DataTable().destroy();
  }

  const history = JSON.parse(localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.AGGREGATE_COMMAND_HISTORY) || '[]');
  tbl.DataTable({
    responsive: true,
    lengthMenu: [5, 10, 20],
    data: history,
    autoWidth: false,
    columns: [
      {
        data: 'collection',
        width: '20%',
      },
      {
        data: 'pipeline',
        width: '60%',
        render(cellData) {
          let str = '';
          for (const stage of cellData) {
            str += `${Object.keys(stage)[0]}<br/>`;
          }
          return str;
        },
      },
      {
        data: 'date',
        width: '20%',
        render(cellData) {
          return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ],
  });

  Ladda.stopAll();
};
