/* eslint-env mocha */

import { SessionManager, UIComponents } from '/client/imports/modules';
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

  describe('initializeOptionsCombobox tests', () => {
    beforeEach(() => {
      sinon.stub(UIComponents.Combobox, 'init');
      sinon.stub(UIComponents.Combobox, 'setOptionsComboboxChangeEvent');
    });

    afterEach(() => {
      UIComponents.Combobox.init.restore();
      UIComponents.Combobox.setOptionsComboboxChangeEvent.restore();
    });

    it('initializeOptionsCombobox valid params', () => {
      // prepare
      const data = { test: 'test' };
      const selector = $('#testing');

      // execute
      UIComponents.Combobox.initializeOptionsCombobox(selector, data);

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector, data, options: {} })).to.equal(true);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.callCount).to.equal(1);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector, undefined)).to.equal(true);
    });

    it('initializeOptionsCombobox valid params (1)', () => {
      // prepare
      const data = { test: 'test' };
      const selector = $('#testing');
      const sessionKey = SessionManager.strSessionSelectedOptions;

      // execute
      UIComponents.Combobox.initializeOptionsCombobox(selector, data, sessionKey);

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector, data, options: {} })).to.equal(true);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.callCount).to.equal(1);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector, sessionKey)).to.equal(true);
    });

    it('initializeOptionsCombobox invalid params', () => {
      // prepare

      // execute
      UIComponents.Combobox.initializeOptionsCombobox($('#testing'), [{ test: 123 }]);

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(0);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.callCount).to.equal(0);
    });

    it('initializeOptionsCombobox invalid params (1)', () => {
      // prepare

      // execute
      UIComponents.Combobox.initializeOptionsCombobox('invalid', { test: 123 });

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(0);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.callCount).to.equal(0);
    });
  });

  describe('setOptionsComboboxChangeEvent tests', () => {
    beforeEach(() => {
      sinon.stub(SessionManager, 'get').returns(['LIMIT', 'SKIP']);
      sinon.stub(SessionManager, 'set');
    });

    afterEach(() => {
      SessionManager.get.restore();
      SessionManager.set.restore();
    });

    it('setOptionsComboboxChangeEvent valid params', () => {
      // prepare
      sinon.stub($.prototype, 'on').yields(null, { deselected: ['LIMIT'] });

      // execute
      UIComponents.Combobox.setOptionsComboboxChangeEvent($('#testing'));

      // verify
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWithMatch('change', sinon.match.func)).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedOptions, ['SKIP'])).to.equal(true);

      // cleanup
      $.prototype.on.restore();
    });

    it('setOptionsComboboxChangeEvent valid params (1)', () => {
      // prepare
      sinon.stub($.prototype, 'on').yields(null, { selected: 'SORT' });

      // execute
      UIComponents.Combobox.setOptionsComboboxChangeEvent($('#testing'));

      // verify
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWithMatch('change', sinon.match.func)).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedOptions, ['LIMIT', 'SKIP', 'SORT'])).to.equal(true);

      // cleanup
      $.prototype.on.restore();
    });

    it('setOptionsComboboxChangeEvent valid params (2)', () => {
      // prepare
      sinon.stub($.prototype, 'on').yields(null, { selected: 'SORT' });

      // execute
      UIComponents.Combobox.setOptionsComboboxChangeEvent($('#testing'), SessionManager.strSessionApplicationLanguage);

      // verify
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWithMatch('change', sinon.match.func)).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionApplicationLanguage, ['LIMIT', 'SKIP', 'SORT'])).to.equal(true);

      // cleanup
      $.prototype.on.restore();
    });

    it('setOptionsComboboxChangeEvent invalid params', () => {
      // prepare
      sinon.spy($.prototype, 'on');

      // execute
      UIComponents.Combobox.setOptionsComboboxChangeEvent('invalid');

      // verify
      expect($.prototype.on.callCount).to.equal(0);
      expect(SessionManager.set.callCount).to.equal(0);

      // cleanup
      $.prototype.on.restore();
    });

    it('setOptionsComboboxChangeEvent invalid params', () => {
      // prepare
      sinon.spy($.prototype, 'on');

      // execute
      UIComponents.Combobox.setOptionsComboboxChangeEvent($('#testing'), '');

      // verify
      expect($.prototype.on.callCount).to.equal(0);
      expect(SessionManager.set.callCount).to.equal(0);

      // cleanup
      $.prototype.on.restore();
    });
  });

  describe('initializeCollectionsCombobox tests', () => {
    beforeEach(() => {
      sinon.stub(SessionManager, 'get').returns([{ name: 'sercan' }, { name: 'tugce' }]);
      sinon.spy(UIComponents.Combobox, 'init');
    });

    afterEach(() => {
      SessionManager.get.restore();
      UIComponents.Combobox.init.restore();
    });

    it('initializeCollectionsCombobox valid params', () => {
      // prepare
      const selector = $('#testing');

      // execute
      UIComponents.Combobox.initializeCollectionsCombobox(selector);

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector, data: { sercan: 'sercan', tugce: 'tugce' }, sortDataByKey: false, comboGroupLabel: 'Collections' })).to.equal(true);
    });

    it('initializeCollectionsCombobox invalid params', () => {
      // prepare

      // execute
      UIComponents.Combobox.initializeCollectionsCombobox('invalid');

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(0);
    });
  });

  describe('deselectAll tests', () => {
    let findStub;
    beforeEach(() => {
      findStub = {
        prop: sinon.stub().returnsThis(),
        trigger: sinon.stub()
      };
      sinon.stub($.prototype, 'find').returns(findStub);
    });

    afterEach(() => {
      $.prototype.find.restore();
    });

    it('deselectAll valid params', () => {
      // prepare
      const selector = $('#testing');

      // execute
      UIComponents.Combobox.deselectAll(selector);

      // verify
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.getCall(0).thisValue.selector).to.equal('#testing');
      expect($.prototype.find.calledWithExactly('option')).to.equal(true);
      expect(findStub.prop.callCount).to.equal(1);
      expect(findStub.prop.calledWithExactly('selected', false)).to.equal(true);
      expect(findStub.trigger.callCount).to.equal(1);
      expect(findStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    });

    it('deselectAll invalid params', () => {
      // prepare

      // execute
      UIComponents.Combobox.deselectAll('invalid');

      // verify
      expect($.prototype.find.callCount).to.equal(0);
      expect(findStub.prop.callCount).to.equal(0);
      expect(findStub.trigger.callCount).to.equal(0);
    });
  });
});
