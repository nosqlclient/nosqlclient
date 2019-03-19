/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import sinon from 'sinon';
import chai, { expect } from 'chai';

import $ from 'jquery';

chai.use(require('chai-jquery'));

describe('UIComponents', () => {
  describe('datatable tests', () => {
    let selector;
    let table;

    before(() => {
      table = selector.DataTable();
      selector = $('<table id="testTable"><thead><tr><th>testingHeader</th><th>Delete</th></tr></thead><tbody>'
        + '<tr id="first_data"><td>first_data</td><td><a href="" title="Delete">delete</a></td></tr>'
        + '<tr id="second_data"><td>second_data</td><td><a href="" title="Delete">delete</a></td></tr></tbody></table>');
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
      beforeEach(() => {
        sinon.stub($.prototype, 'DataTable').returns(table);
        sinon.spy(UIComponents.DataTable, 'getDatatableLanguageOptions');
      });

      afterEach(() => {
        $.prototype.DataTable.restore();
        UIComponents.DataTable.getDatatableLanguageOptions.restore();
      });

      it('initiateDatatable with correct selector & sessionKey, clickCallback, noDeleteEvent are empty', () => {
        // prepare
        // execute
        UIComponents.DataTable.initiateDatatable({ selector });

        // verify
        expect($.prototype.DataTable.callCount).to.equal(1);
        expect($.prototype.DataTable.calledWith(sinon.match({ language: {} }))).to.equal(true);
        expect($.prototype.DataTable.getCall(0).thisValue).to.have.id('testTable');
      });
    });
  });
});
