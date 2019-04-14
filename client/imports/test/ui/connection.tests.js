/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Connection } from '/client/imports/ui';
import { ErrorHandler, SessionManager, Notification } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';

require('/client/plugins/colorpicker/js/bootstrap-colorpicker.min');

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

  describe('prepareContextMenu tests', () => {
    const connectionId = '12321312';
    const connection = { x: 1, y: true, z: 'sercan' };

    beforeEach(() => {
      sinon.stub($, 'contextMenu');
      sinon.stub($.prototype, 'data');
      sinon.stub($.prototype, 'modal');
      sinon.stub($.prototype, 'DataTable').returns({ row: sinon.stub().returns({ data: sinon.stub().returns({ _id: connectionId }) }) });
      sinon.stub(ReactivityProvider, 'findOne').returns(connection);
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Notification, 'success');
      sinon.stub(Connection, 'populateConnectionsTable');
    });

    afterEach(() => {
      $.contextMenu.restore();
      $.prototype.data.restore();
      $.prototype.modal.restore();
      $.prototype.DataTable.restore();
      ReactivityProvider.findOne.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.success.restore();
      Connection.populateConnectionsTable.restore();
    });

    it('prepareContextMenu colorize callback', () => {
      // prepare
      // execute
      Connection.prepareContextMenu();
      $.contextMenu.getCall(0).args[0].items.colorize.callback(null, { $trigger: ['something'] });

      // verify
      expect($.contextMenu.callCount).to.equal(1);
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('colorize');
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('clear_color');
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('connection', connectionId)).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('show')).to.equal(true);
    });

    it('prepareContextMenu clear_color callback && communicator yields to error', () => {
      // prepare
      const error = { error: '123' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);

      // execute
      Connection.prepareContextMenu();
      $.contextMenu.getCall(0).args[0].items.clear_color.callback(null, { $trigger: ['something'] });

      // verify
      expect($.contextMenu.callCount).to.equal(1);
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('colorize');
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('clear_color');
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'saveConnection',
        args: { connection: Object.assign({ color: '' }, connection) },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);

      // cleanup
      Communicator.call.restore();
    });

    it('prepareContextMenu clear_color callback && communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback');

      // execute
      Connection.prepareContextMenu();
      $.contextMenu.getCall(0).args[0].items.clear_color.callback(null, { $trigger: ['something'] });

      // verify
      expect($.contextMenu.callCount).to.equal(1);
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('colorize');
      expect($.contextMenu.getCall(0).args[0].items).to.have.property('clear_color');
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'saveConnection',
        args: { connection: Object.assign({ color: '' }, connection) },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('saved-successfully')).to.equal(true);
      expect(Connection.populateConnectionsTable.callCount).to.equal(1);
      expect(Connection.populateConnectionsTable.calledWithExactly()).to.equal(true);

      // cleanup
      Communicator.call.restore();
    });
  });

  describe('prepareColorizeModal tests', () => {
    const color = '#111111';

    beforeEach(() => {
      const connectionId = '1231235612';

      sinon.stub($.prototype, 'colorpicker');
      sinon.stub($.prototype, 'on').yields(null);
      sinon.stub($.prototype, 'data').withArgs('connection').returns(connectionId);
      sinon.stub(ReactivityProvider, 'findOne').withArgs(ReactivityProvider.types.Connections, { _id: connectionId }).returns({ color });
    });

    afterEach(() => {
      $.prototype.colorpicker.restore();
      $.prototype.on.restore();
      $.prototype.data.restore();
      ReactivityProvider.findOne.restore();
    });

    it('prepareColorizeModal', () => {
      // prepare
      // execute
      Connection.prepareColorizeModal();

      // verify
      expect($.prototype.colorpicker.callCount).to.equals(2);
      expect($.prototype.colorpicker.calledWithMatch({ align: 'left', format: 'hex' })).to.equals(true);
      expect($.prototype.colorpicker.calledWithMatch('setValue', color)).to.equals(true);
      expect($.prototype.on.callCount).to.equals(1);
      expect($.prototype.on.calledWithMatch('shown.bs.modal', sinon.match.func)).to.equals(true);
    });
  });
});
