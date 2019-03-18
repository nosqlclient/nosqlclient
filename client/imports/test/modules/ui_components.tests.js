/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import { expect } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';
import $ from 'jquery';

describe('UIComponents', () => {
  describe('datatable tests', () => {
    let jquerySelector;

    before(() => {
      jquerySelector = $('<table id="testTable"><thead><tr><th>testingHeader</th><th>Delete</th></tr></thead><tbody><tr id="first_data"><td>first_data</td><td>'
        + '<a href="" title="Delete">delete</a></td></tr></tbody></table>');
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
        expect(jquerySelector.find.callCount).to.equal(2);
        expect(jquerySelector.find.alwaysCalledWithExactly('tbody')).to.equal(true);
        expect(jquerySelector.find('tbody').on.callCount).to.equal(1);
        expect(jquerySelector.find('tbody').on.calledWithExactly('click', 'a.editor_delete', sinon.match.func)).to.equal(true);
      });

      it('attachDeleteTableRowEvent with wrong param', () => {
        // prepare
        // execute
        UIComponents.DataTable.attachDeleteTableRowEvent(123);

        // verify
        expect(jquerySelector.find.callCount).to.equal(0);
        expect(jquerySelector.find('tbody').on.callCount).to.equal(0);
      });

      it('attachDeleteTableRowEvent with wrong selector', () => {
        // prepare
        // execute
        UIComponents.DataTable.attachDeleteTableRowEvent($('#testttt'));

        // verify
        expect(jquerySelector.find.callCount).to.equal(1);
        expect(jquerySelector.find.alwaysCalledWithExactly('tbody')).to.equal(true);
        expect(jquerySelector.find('tbody').on.callCount).to.equal(0);
      });
    });
  });
});
