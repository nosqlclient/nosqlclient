/* eslint-env mocha */

import { UIComponents, SessionManager } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));

describe('UIComponents DataTable', () => {
  let selector;
  let table;

  before(() => {
    selector = $('<table id="testTable"><thead><tr><th>testingHeader</th><th>Delete</th></tr></thead><tbody>'
        + '<tr id="first_data"><td>first_data</td><td><a href="" title="Delete">delete</a></td></tr>'
        + '<tr id="second_data"><td>second_data</td><td><a href="" title="Delete">delete</a></td></tr></tbody></table>');
    table = selector.DataTable();
  });

  after(() => {
    selector = null;
    table = null;
  });

  describe('attachDeleteTableRowEvent tests', () => {
    beforeEach(() => {
      sinon.spy($.prototype, 'find');
      sinon.stub($.prototype, 'on').withArgs('click', 'a.editor_delete');
      // FIXME can't test it's actually removed, it's almost impossible to stub jquery's draw method.
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.prototype.on.restore();
    });

    it('attachDeleteTableRowEvent with correct selector', () => {
      // prepare
      // execute
      UIComponents.DataTable.attachDeleteTableRowEvent(selector);

      // verify
      expect($.prototype.find.callCount).to.equal(2);
      expect($.prototype.find.alwaysCalledWithExactly('tbody')).to.equal(true);
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWithExactly('click', 'a.editor_delete', sinon.match.func)).to.equal(true);
    });

    it('attachDeleteTableRowEvent with wrong param', () => {
      // prepare
      // execute
      UIComponents.DataTable.attachDeleteTableRowEvent(123);

      // verify
      expect($.prototype.find.callCount).to.equal(0);
      expect($.prototype.on.callCount).to.equal(0);
    });

    it('attachDeleteTableRowEvent with wrong selector', () => {
      // prepare
      // execute
      UIComponents.DataTable.attachDeleteTableRowEvent($('#testttt'));

      // verify
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.alwaysCalledWithExactly('tbody')).to.equal(true);
      expect($.prototype.on.callCount).to.equal(0);
    });
  });

  describe('toggleDatatableRowSelection tests', () => {
    beforeEach(() => {
      sinon.spy($.prototype, 'hasClass');
      sinon.spy($.prototype, 'removeClass');
      sinon.spy($.prototype, 'addClass');
    });

    afterEach(() => {
      $.prototype.hasClass.restore();
      $.prototype.removeClass.restore();
      $.prototype.addClass.restore();
    });

    it('toggleDatatableRowSelection with correct table & not selected row', () => {
      // prepare
      const row = table.$('#first_data');

      // execute
      UIComponents.DataTable.toggleDatatableRowSelection(table, row);

      // verify
      expect($.prototype.hasClass.callCount).to.equal(1);
      expect($.prototype.hasClass.calledWithExactly('selected')).to.equal(true);
      expect($.prototype.hasClass.getCall(0).thisValue).to.have.id('first_data');
      expect($.prototype.removeClass.callCount).to.equal(1);
      expect($.prototype.removeClass.calledWithExactly('selected')).to.equal(true);
      expect($.prototype.removeClass.getCall(0).thisValue.length).to.equal(0);
      expect($.prototype.addClass.callCount).to.equal(1);
      expect($.prototype.addClass.calledWithExactly('selected')).to.equal(true);
      expect($.prototype.addClass.getCall(0).thisValue).to.have.id('first_data');
    });

    it('toggleDatatableRowSelection with correct table & selected row', () => {
      // prepare
      const row = table.$('#second_data');
      row.addClass('selected');

      // execute
      UIComponents.DataTable.toggleDatatableRowSelection(table, row);

      // verify
      expect($.prototype.hasClass.callCount).to.equal(1);
      expect($.prototype.hasClass.calledWithExactly('selected')).to.equal(true);
      expect($.prototype.hasClass.getCall(0).thisValue).to.have.id('second_data');
      expect($.prototype.removeClass.callCount).to.equal(1);
      expect($.prototype.removeClass.calledWithExactly('selected')).to.equal(true);
      expect($.prototype.removeClass.getCall(0).thisValue).to.have.id('second_data');
      expect($.prototype.addClass.callCount).to.equal(1); // we called it on prepare
    });

    it('toggleDatatableRowSelection with wrong table & correct row', () => {
      // prepare
      const row = table.$('#second_data');

      // execute
      UIComponents.DataTable.toggleDatatableRowSelection(selector.find('#first_data')[0], row);

      // verify
      expect($.prototype.hasClass.callCount).to.equal(0);
      expect($.prototype.removeClass.callCount).to.equal(0);
      expect($.prototype.addClass.callCount).to.equal(0);
    });

    it('toggleDatatableRowSelection with correct table & wrong row', () => {
      // prepare

      // execute
      UIComponents.DataTable.toggleDatatableRowSelection(table, 'test');

      // verify
      expect($.prototype.hasClass.callCount).to.equal(0);
      expect($.prototype.removeClass.callCount).to.equal(0);
      expect($.prototype.addClass.callCount).to.equal(0);
    });
  });

  describe('getDatatableLanguageOptions tests', () => {
    beforeEach(() => {
      sinon.spy(Helper, 'translate');
    });

    afterEach(() => {
      Helper.translate.restore();
    });

    it('getDatatableLanguageOptions should return all datatable language options', () => {
      // prepare
      // execute
      const languageOptions = UIComponents.DataTable.getDatatableLanguageOptions();

      // verify
      expect(Object.keys(languageOptions).length).to.equal(13);
      expect(Helper.translate.callCount).to.equal(17);
    });
  });

  describe('initiateDatatable tests', () => {
    const assertInitiateDataTableNormalBehaviour = function (tableStub, tableSelector, withSession, withoutNoDelete = true) {
      expect($.prototype.DataTable.callCount).to.equal(2);
      expect($.prototype.DataTable.getCall(0).args[0]).to.have.property('language');
      expect($.prototype.DataTable.getCall(0).thisValue).to.have.id('testTable');
      expect($.prototype.DataTable.getCall(1).args.length).to.equal(0);
      expect($.prototype.DataTable.getCall(1).thisValue).to.have.id('testTable');

      expect($.prototype.find.callCount).to.equal(2); // once gets called on beforeEach
      expect($.prototype.find.getCall(1).args[0]).to.equal('tbody');
      expect($.prototype.find.getCall(1).thisValue).to.have.id('testTable');

      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWith('click', 'tr', sinon.match.func)).to.equal(true);

      expect(UIComponents.DataTable.toggleDatatableRowSelection.callCount).to.equal(1);
      expect(UIComponents.DataTable.toggleDatatableRowSelection.calledWithMatch(tableStub)).to.equal(true);
      expect(UIComponents.DataTable.toggleDatatableRowSelection.getCall(0).args[1]).to.have.id('first_data');

      expect(tableStub.row.callCount).to.equal(1);
      expect(tableStub.row.calledWith(tableSelector.find('#first_data'))).to.equal(true);
      expect(tableStub.data.callCount).to.equal(1);
      expect(tableStub.data.getCall(0).args.length).to.equal(0);
      expect(tableStub.data.returned('data')).to.equal(true);

      if (withoutNoDelete) {
        expect(UIComponents.DataTable.attachDeleteTableRowEvent.callCount).to.equal(1);
        expect(UIComponents.DataTable.attachDeleteTableRowEvent.calledWithMatch(tableSelector)).to.equal(true);
      }

      if (withSession) {
        expect(SessionManager.set.callCount).to.equal(1);
        expect(SessionManager.set.calledWithExactly(SessionManager.strSessionConnection, 'data')).to.equal(true);
      }
    };

    let tableStub;
    beforeEach(() => {
      tableStub = {
        row: sinon.stub().returnsThis(),
        data: sinon.stub().returns('data')
      };

      sinon.stub($.prototype, 'DataTable').returns(tableStub);
      sinon.stub(Helper, 'translate').returns('translated');
      sinon.stub(UIComponents.DataTable, 'getDatatableLanguageOptions').returns({});
      sinon.stub(UIComponents.DataTable, 'toggleDatatableRowSelection');
      sinon.stub(UIComponents.DataTable, 'attachDeleteTableRowEvent');
      sinon.stub(SessionManager, 'set');
      sinon.spy($.prototype, 'find');
      sinon.stub($.prototype, 'on').yieldsOn(selector.find('#first_data'));
    });

    afterEach(() => {
      $.prototype.DataTable.restore();
      Helper.translate.restore();
      UIComponents.DataTable.getDatatableLanguageOptions.restore();
      UIComponents.DataTable.toggleDatatableRowSelection.restore();
      UIComponents.DataTable.attachDeleteTableRowEvent.restore();
      SessionManager.set.restore();
      $.prototype.find.restore();
      $.prototype.on.restore();
    });

    it('initiateDatatable with correct selector & sessionKey, clickCallback, noDeleteEvent are empty', () => {
      // prepare
      // execute
      UIComponents.DataTable.initiateDatatable({ selector });

      // verify
      assertInitiateDataTableNormalBehaviour(tableStub, selector);
      expect(SessionManager.set.callCount).to.equal(0);
    });

    it('initiateDatatable with wrong selector & sessionKey, clickCallback, noDeleteEvent are empty', () => {
      // prepare
      // execute
      UIComponents.DataTable.initiateDatatable({ selector: '' });

      // verify
      expect($.prototype.DataTable.callCount).to.equal(0);
      expect($.prototype.find.callCount).to.equal(1); // gets called on beforeEach
      expect($.prototype.on.callCount).to.equal(0);
      expect(UIComponents.DataTable.toggleDatatableRowSelection.callCount).to.equal(0);
      expect(tableStub.row.callCount).to.equal(0);
      expect(tableStub.data.callCount).to.equal(0);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(UIComponents.DataTable.attachDeleteTableRowEvent.callCount).to.equal(0);
    });

    it('initiateDatatable with correct selector, sessionKey is filled & clickCallback, noDeleteEvent are empty', () => {
      // prepare
      // execute
      UIComponents.DataTable.initiateDatatable({ selector, sessionKey: SessionManager.strSessionConnection });

      // verify
      assertInitiateDataTableNormalBehaviour(tableStub, selector, true);
    });

    it('initiateDatatable with correct selector, sessionKey, clickCallback are filled & noDeleteEvent are empty', () => {
      // prepare
      const spy = sinon.spy();

      // execute
      UIComponents.DataTable.initiateDatatable({ selector, sessionKey: SessionManager.strSessionConnection, clickCallback: spy });

      // verify
      assertInitiateDataTableNormalBehaviour(tableStub, selector, true);
      expect(spy.callCount).to.equal(1);
    });

    it('initiateDatatable with correct selector, sessionKey, clickCallback, noDeleteEvent are filled', () => {
      // prepare
      const spy = sinon.spy();

      // execute
      UIComponents.DataTable.initiateDatatable({ selector, sessionKey: SessionManager.strSessionConnection, clickCallback: spy, noDeleteEvent: true });

      // verify
      assertInitiateDataTableNormalBehaviour(tableStub, selector, true, false);
      expect(spy.callCount).to.equal(1);
      expect(UIComponents.DataTable.attachDeleteTableRowEvent.callCount).to.equal(0);
    });
  });

  describe('setupDatatable tests', () => {
    const assertNoCallBehaviour = function (tableStub) {
      expect($.prototype.find.callCount).to.equal(0);
      expect($.prototype.DataTable.callCount).to.equal(0);
      expect(tableStub.destroy.callCount).to.equal(0);
    };

    let tableStub;
    const data = [{ name: 'sercan', type: 'collection' }, { name: 'tugce', type: 'collection' }];
    const columns = [{ data: 'name' }, { data: 'type' }];
    const columnDefs = [{ targets: [2], data: null, width: '10%', render() { return '<input type="checkbox"/>'; } }];

    beforeEach(() => {
      tableStub = {
        destroy: sinon.stub().returns('data'),
        draw: sinon.stub()
      };

      sinon.spy($.prototype, 'find');
      sinon.stub($.fn.dataTable, 'isDataTable')
        .withArgs('datatable').returns(true)
        .withArgs('noTable')
        .returns(false);
      sinon.stub($.prototype, 'DataTable').returns(tableStub);
      sinon.stub(Helper, 'translate').returns('translated');
      sinon.stub(UIComponents.DataTable, 'getDatatableLanguageOptions').returns({});
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.fn.dataTable.isDataTable.restore();
      $.prototype.DataTable.restore();
      Helper.translate.restore();
      UIComponents.DataTable.getDatatableLanguageOptions.restore();
    });

    it('setupDatatable with correct params & datatable initialized selector', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'datatable', data, columns, columnDefs });

      // verify
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.calledWith('datatable')).to.equal(true);
      expect($.prototype.DataTable.callCount).to.equal(2);
      expect(tableStub.destroy.callCount).to.equal(1);
      expect($.prototype.DataTable.calledWith({
        language: {},
        data,
        columns,
        columnDefs,
        autoWidth: true,
        lengthMenu: [5, 10, 20],
        responsive: true,
        destroy: true,
        stateSave: true
      })).to.equal(true);
    });

    it('setupDatatable with correct params & datatable not initialized selector', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'noTable', data, columns, columnDefs });

      // verify
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.calledWith('noTable')).to.equal(true);
      expect($.prototype.DataTable.callCount).to.equal(1);
      expect(tableStub.destroy.callCount).to.equal(0);
      expect($.prototype.DataTable.calledWith({
        language: {},
        data,
        columns,
        columnDefs,
        autoWidth: true,
        lengthMenu: [5, 10, 20],
        responsive: true,
        destroy: true,
        stateSave: true
      })).to.equal(true);
    });

    it('setupDatatable with wrong params (1)', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'datatable', data: {}, columns, columnDefs });

      // verify
      assertNoCallBehaviour(tableStub);
    });

    it('setupDatatable with wrong params (1)', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ data, columns, columnDefs });

      // verify
      assertNoCallBehaviour(tableStub);
    });

    it('setupDatatable with wrong params (2)', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'datatable', data: 123, columns, columnDefs: {} });

      // verify
      assertNoCallBehaviour(tableStub);
    });

    it('setupDatatable with wrong params (3)', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'datatable', data, columns, columnDefs: {} });

      // verify
      assertNoCallBehaviour(tableStub);
    });

    it('setupDatatable with wrong params (4)', () => {
      // prepare
      // execute
      UIComponents.DataTable.setupDatatable({ selectorString: 'datatable', data, columns: {}, columnDefs });

      // verify
      assertNoCallBehaviour(tableStub);
    });
  });
});
