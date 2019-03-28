/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));
require('/client/plugins/iCheck/icheck.min');

describe('UIComponents Checkbox', () => {
  describe('init tests', () => {
    beforeEach(() => {
      sinon.spy($.prototype, 'iCheck');
    });

    afterEach(() => {
      $.prototype.iCheck.restore();
    });

    it('init with valid selector & without state', () => {
      // prepare

      // execute
      UIComponents.Checkbox.init($('#testing'));

      // verify
      expect($.prototype.iCheck.callCount).to.equal(1);
      expect($.prototype.iCheck.calledWithMatch({ checkboxClass: 'icheckbox_square-green' })).to.equal(true);
    });

    it('init with valid selector & with valid state', () => {
      // prepare

      // execute
      UIComponents.Checkbox.init($('#testing'), 'check');

      // verify
      expect($.prototype.iCheck.callCount).to.equal(2);
      expect($.prototype.iCheck.getCall(0).args[0]).to.eql({ checkboxClass: 'icheckbox_square-green' });
      expect($.prototype.iCheck.getCall(1).args[0]).to.equal('check');
    });

    it('init with valid selector & with invalid state', () => {
      // prepare

      // execute
      UIComponents.Checkbox.init($('#testing'), 'ddd');

      // verify
      expect($.prototype.iCheck.callCount).to.equal(1);
      expect($.prototype.iCheck.calledWithMatch({ checkboxClass: 'icheckbox_square-green' })).to.equal(true);
    });

    it('init with invalid selector', () => {
      // prepare

      // execute
      UIComponents.Checkbox.init('invalid');

      // verify
      expect($.prototype.iCheck.callCount).to.equal(0);
    });
  });

  describe('getState tests', () => {
    it('getState with valid selector & not initialized iCheck', () => {
      // prepare
      sinon.spy($.prototype, 'iCheck');

      // execute
      const state = UIComponents.Checkbox.getState($('#testing'));

      // verify
      expect($.prototype.iCheck.callCount).to.equal(1);
      expect($.prototype.iCheck.calledWithMatch('update')).to.equal(true);
      expect(state).to.equal(false);

      // cleanup
      $.prototype.iCheck.restore();
    });

    it('getState with valid selector & initialized iCheck', () => {
      // prepare
      sinon.stub($.prototype, 'iCheck').returns([{ checked: true }]);

      // execute
      const state = UIComponents.Checkbox.getState($('#testing'));

      // verify
      expect($.prototype.iCheck.callCount).to.equal(2);
      expect($.prototype.iCheck.alwaysCalledWith('update')).to.equal(true);
      expect(state).to.equal(true);

      // cleanup
      $.prototype.iCheck.restore();
    });

    it('getState with invalid selector', () => {
      // prepare
      sinon.spy($.prototype, 'iCheck');

      // execute
      const state = UIComponents.Checkbox.getState('invalid');

      // verify
      expect($.prototype.iCheck.callCount).to.equal(0);
      expect(state).to.equal(false);

      // cleanup
      $.prototype.iCheck.restore();
    });
  });

  describe('toggleState tests', () => {
    beforeEach(() => {
      sinon.spy($.prototype, 'iCheck');
    });

    afterEach(() => {
      $.prototype.iCheck.restore();
    });

    it('toggleState with valid selector & valid state', () => {
      // prepare
      const state = 'check';

      // execute
      UIComponents.Checkbox.toggleState($('#testing'), state);

      // verify
      expect($.prototype.iCheck.callCount).to.equal(1);
      expect($.prototype.iCheck.calledWithExactly(state)).to.equal(true);
    });

    it('toggleState with valid selector & valid state (1)', () => {
      // prepare
      const state = 'disable';

      // execute
      UIComponents.Checkbox.toggleState($('#testing'), state);

      // verify
      expect($.prototype.iCheck.callCount).to.equal(1);
      expect($.prototype.iCheck.calledWithExactly(state)).to.equal(true);
    });

    it('toggleState with invalid selector', () => {
      // prepare
      const state = 'disable';

      // execute
      UIComponents.Checkbox.toggleState('testing', state);

      // verify
      expect($.prototype.iCheck.callCount).to.equal(0);
    });

    it('toggleState with invalid state', () => {
      // prepare

      // execute
      UIComponents.Checkbox.toggleState($('#testing'), 'invalid');

      // verify
      expect($.prototype.iCheck.callCount).to.equal(0);
    });
  });
});
