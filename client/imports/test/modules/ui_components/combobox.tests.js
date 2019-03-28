/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));
require('/client/plugins/chosen_fork/chosen.jquery');

describe('UIComponents Combobox', () => {
  describe('init tests', () => {
    const assert = function () {
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.chosen.callCount).to.equal(1);
      expect($.prototype.chosen.calledWithMatch({ create_option: true, allow_single_deselect: true, persistent_create_option: true, skip_no_results: true })).to.equal(true);
      expect($.prototype.chosen.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.trigger.callCount).to.equal(1);
      expect($.prototype.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    };

    beforeEach(() => {
      sinon.spy($.prototype, 'empty');
      sinon.spy($.prototype, 'attr');
      sinon.spy($.prototype, 'text');
      sinon.spy($.prototype, 'prepend');
      sinon.spy($.prototype, 'append');
      sinon.spy($.prototype, 'chosen');
      sinon.spy($.prototype, 'trigger');
    });

    afterEach(() => {
      $.prototype.empty.restore();
      $.prototype.attr.restore();
      $.prototype.text.restore();
      $.prototype.prepend.restore();
      $.prototype.append.restore();
      $.prototype.chosen.restore();
      $.prototype.trigger.restore();
    });

    it('init tests with valid params', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing') });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(1);
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.append.callCount).to.equal(0);
    });

    it('init tests with valid params (1)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { name: 'sercan', surname: 'ozdemir' } });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(3); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
    });
  });
});
