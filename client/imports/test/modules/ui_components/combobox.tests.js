/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));
require('/client/plugins/chosen_fork/chosen.jquery');

describe('UIComponents Combobox', () => {
  describe('init tests', () => {
    const assert = function (options = { create_option: true, allow_single_deselect: true, persistent_create_option: true, skip_no_results: true }) {
      expect($.prototype.chosen.callCount).to.equal(1);
      expect($.prototype.chosen.calledWithMatch(options)).to.equal(true);
      expect($.prototype.chosen.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.trigger.callCount).to.equal(1);
      expect($.prototype.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    };

    const assertNoExecution = function () {
      expect($.prototype.chosen.callCount).to.equal(0);
      expect($.prototype.trigger.callCount).to.equal(0);
      expect($.prototype.empty.callCount).to.equal(0);
      expect($.prototype.prepend.callCount).to.equal(0);
      expect($.prototype.append.callCount).to.equal(0);
    };

    beforeEach(() => {
      sinon.spy($.prototype, 'find');
      sinon.spy($.prototype, 'empty');
      sinon.spy($.prototype, 'attr');
      sinon.spy($.prototype, 'text');
      sinon.spy($.prototype, 'prepend');
      sinon.spy($.prototype, 'append');
      sinon.spy($.prototype, 'chosen');
      sinon.spy($.prototype, 'trigger');
    });

    afterEach(() => {
      $.prototype.find.restore();
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
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(0);
    });

    it('init tests with valid params (1)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { surname: 'ozdemir', name: 'sercan' } });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(3); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<option></option>').attr('value', 'surname').text('ozdemir'));
    });

    it('init tests with valid params (2)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { name: 'sercan' }, comboGroupLabel: 'group' });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(2); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<optgroup id="optGroup" label="group"></optgroup>'));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing #optGroup');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.find.calledWithExactly('#optGroup')).to.equal(true);
    });

    it('init tests with valid params (3)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { name: 'sercan' }, comboGroupLabel: 'group', prependOptions: $("<option value='anyResource'>anyResource</option>") });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(2); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(3);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($("<option value='anyResource'>anyResource</option>"));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<optgroup id="optGroup" label="group"></optgroup>'));
      expect($.prototype.append.getCall(2).thisValue.selector).to.equal('#testing #optGroup');
      expect($.prototype.append.getCall(2).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.find.calledWithExactly('#optGroup')).to.equal(true);
    });

    it('init tests with valid params (4)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { surname: 'ozdemir', name: 'sercan' }, sortDataByKey: false });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(3); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<option></option>').attr('value', 'surname').text('ozdemir'));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
    });

    it('init tests with valid params (5)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { surname: 'ozdemir', name: 'sercan' }, options: { testing_opt: true } });

      // verify
      assert({ testing_opt: true });
      expect($.prototype.empty.callCount).to.equal(3); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(1);
      expect($.prototype.prepend.calledWithExactly("<option value=''></option>")).to.equal(true);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<option></option>').attr('value', 'surname').text('ozdemir'));
    });

    it('init tests with valid params (6)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { surname: 'ozdemir', name: 'sercan' }, empty: false });

      // verify
      assert();
      expect($.prototype.empty.callCount).to.equal(2); // gets called internally for each data
      expect($.prototype.empty.calledWithExactly()).to.equal(true);
      expect($.prototype.prepend.callCount).to.equal(0);
      expect($.prototype.append.callCount).to.equal(2);
      expect($.prototype.append.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(0).args[0]).to.eql($('<option></option>').attr('value', 'name').text('sercan'));
      expect($.prototype.append.getCall(1).thisValue.selector).to.equal('#testing');
      expect($.prototype.append.getCall(1).args[0]).to.eql($('<option></option>').attr('value', 'surname').text('ozdemir'));
    });

    it('init tests with invalid params', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: 'invalid' });

      // verify
      assertNoExecution();
    });

    it('init tests with invalid params (1)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: [{ test: 123 }] });

      // verify
      assertNoExecution();
    });

    it('init tests with invalid params (2)', () => {
      // prepare

      // execute
      UIComponents.Combobox.init({ selector: $('#testing'), data: { surname: 'ozdemir', name: 'sercan' }, prependOptions: 'invalid' });

      // verify
      assertNoExecution();
    });
  });
});
