/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import chai, { expect } from 'chai';

import $ from 'jquery';

chai.use(require('chai-dom'));

describe('UIComponents', () => {
  describe('datatable tests', () => {
    let jquerySelector;
    let table;

    before(() => {
      jquerySelector = $('<table id="testTable"><thead><tr id="selected_data"><th>testingHeader</th><th>Delete</th></tr></thead><tbody><tr id="first_data"><td>first_data</td><td>'
        + '<a href="" title="Delete">delete</a></td></tr></tbody></table>');
      table = jquerySelector.DataTable();
    });

    after(() => {
      jquerySelector = null;
      table = null;
    });

    describe('attachDeleteTableRowEvent tests', () => {
      beforeEach(() => {
        sinon.spy($.prototype, 'find');
        sinon.stub($.prototype, 'on').withArgs('click', 'a.editor_delete');
        // FIXME can't make this work
        // sinon.stub($.prototype, 'row').returns($('<tr id="first_data"><td>first_data</td><td><a href="" title="Delete">delete</a></td></tr>'));
      });

      afterEach(() => {
        $.prototype.find.restore();
        $.prototype.on.restore();
        // $.prototype.row.restore();
      });

      it('attachDeleteTableRowEvent with correct selector', () => {
        // prepare
        // execute
        UIComponents.DataTable.attachDeleteTableRowEvent(jquerySelector);

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
        expect($.prototype.hasClass.getCall(0).thisValue).to.have.attribute('id', 'first_data');
        expect($.prototype.removeClass.callCount).to.equal(1);
        expect($.prototype.removeClass.calledWithExactly('selected')).to.equal(true);
        // expect($.prototype.removeClass.getCall(0).thisValue).to.have.property('length', 0);
        expect($.prototype.addClass.callCount).to.equal(1);
        expect($.prototype.addClass.calledWithExactly('selected')).to.equal(true);
        expect($.prototype.addClass.getCall(0).thisValue).to.have.property(0, { _DT_RowIndex: 0 });
      });
    });
  });
});
