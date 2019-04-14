/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Connection } from '/client/imports/ui';
import { SessionManager } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';

describe('Connection', () => {
  describe('prepareModal tests', () => {
    const translated = 'TESTTRANSLATED';
    const connectionId = '123123123';

    const assert = function (editOrClone) {
      expect($.prototype.text.callCount).to.equal(1);
      expect($.prototype.text.calledWithExactly(translated)).to.equal(true);
      expect($.prototype.data.callCount).to.equal(2);
      expect($.prototype.data.calledWithExactly('edit', editOrClone === 'edit' ? connectionId : '')).to.equal(true);
      expect($.prototype.data.calledWithExactly('clone', editOrClone === 'clone' ? connectionId : '')).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('show')).to.equal(true);
      expect(SessionManager.get.callCount).to.equal(editOrClone ? 1 : 0);
      if (editOrClone) expect(SessionManager.get.calledWithExactly(SessionManager.strSessionConnection)).to.equal(true);
    };

    beforeEach(() => {
      sinon.stub($.prototype, 'data');
      sinon.stub($.prototype, 'modal');
      sinon.stub($.prototype, 'text');
      sinon.stub(Helper, 'translate').returns(translated);
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionConnection).returns({ _id: connectionId });
    });

    afterEach(() => {
      $.prototype.data.restore();
      $.prototype.modal.restore();
      $.prototype.text.restore();
      Helper.translate.restore();
      SessionManager.get.restore();
    });

    it('prepareModal no param', () => {
      // prepare
      // execute
      Connection.prepareModal();

      // verify
      assert();
    });

    it('prepareModal valid param edit', () => {
      // prepare
      // execute
      Connection.prepareModal('does not matter', 'edit');

      // verify
      assert('edit');
    });

    it('prepareModal valid param clone', () => {
      // prepare
      // execute
      Connection.prepareModal('does not matter', 'clone');

      // verify
      assert('clone');
    });
  });

  describe('disconnect tests', () => {
    beforeEach(() => {
      sinon.stub(Communicator, 'call');
      sinon.stub(SessionManager, 'clear');
      sinon.stub(FlowRouter, 'go');
    });

    afterEach(() => {
      Communicator.call.restore();
      SessionManager.clear.restore();
      FlowRouter.go.restore();
    });

    it('disconnect', () => {
      // prepare
      // execute
      Connection.disconnect();

      // verify
      expect(Communicator.call.callCount).to.equals(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'disconnect' })).to.equals(true);
      expect(SessionManager.clear.callCount).to.equals(1);
      expect(SessionManager.clear.calledWithExactly()).to.equals(true);
      expect(FlowRouter.go.callCount).to.equals(1);
      expect(FlowRouter.go.calledWithExactly('/databaseStats')).to.equals(true);
    });
  });
});
