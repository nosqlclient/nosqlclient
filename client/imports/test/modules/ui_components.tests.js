/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import { expect } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';
import $ from 'jquery';

describe('UIComponents', () => {
  describe('datatable tests', () => {
    let jquerySelector;

    before(() => {
      $(document.body).append('<table id="testTable"><thead><tr><th>testingHeader</th></tr></thead><tbody><tr><td>first_data</td></tr><tr><td>second_data</td></tr></tbody></table>');
      jquerySelector = $('#testTable');
    });

    describe('attachDeleteTableRowEvent tests', () => {
      beforeEach(() => {
        sinon.spy($.prototype, 'find');
        sinon.spy($.prototype, 'on');
      });

      afterEach(() => {
        $.prototype.find.restore();
        $.prototype.on.restore();
      });

      it('attachDeleteTableRowEvent with correct selector', () => {
        // prepare
        // execute
        UIComponents.DataTable.attachDeleteTableRowEvent(jquerySelector);

        // verify
        expect(jquerySelector.find.callCount).to.equal(2);
        expect(jquerySelector.find.alwaysCalledWithExactly('tbody')).to.equal(true);
        expect(jquerySelector.find('tbody').on.callCount).to.equal(1);
        expect(jquerySelector.find('tbody').on.calledWithExactly('click', 'a.editor_delete', sinon.match.func)).to.equal(true);
        // TODO test content of callback ?
      });
    });
  });
});
