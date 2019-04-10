/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { ErrorHandler, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import { ViewPipelineUpdater } from '/client/imports/ui/collection';
import { Communicator, ReactivityProvider } from '/client/imports/facades';

describe('CollectionRename', () => {
  describe('initialize tests', () => {
    const viewName = 'view_name_test';
    const dbName = 'sercanDB';
    let jsonEditorStub;

    beforeEach(() => {
      jsonEditorStub = {
        set: sinon.stub()
      };

      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub(Notification, 'warning');
      sinon.stub(UIComponents.Combobox, 'initializeCollectionsCombobox');
      sinon.stub(SessionManager, 'get').returns({ _id: '' });
      sinon.stub(ReactivityProvider, 'findOne').returns({ databaseName: dbName });
      sinon.stub($.prototype, 'data').withArgs('jsoneditor').returns(jsonEditorStub).withArgs('viewName')
        .returns(viewName);
      sinon.stub($.prototype, 'modal');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
    });

    afterEach(() => {
      Notification.start.restore();
      Notification.stop.restore();
      Notification.warning.restore();
      UIComponents.Combobox.initializeCollectionsCombobox.restore();
      SessionManager.get.restore();
      ReactivityProvider.findOne.restore();
      ErrorHandler.showMeteorFuncError.restore();
      $.prototype.modal.restore();
      $.prototype.data.restore();
      Communicator.call.restore();
    });

    it('initialize & communicator yields error', () => {
      // prepare
      const error = { error: '122' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);

      // execute
      ViewPipelineUpdater.initialize();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveViewPipeline')).to.equal(true);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.calledWithExactly($('#cmbCollectionsUpdateViewPipeline'))).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'listCollectionNames',
        args: { dbName },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#updateViewPipelineModal');
      expect(jsonEditorStub.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(0);
    });

    it('initialize & communicator yields error (1)', () => {
      // prepare
      const result = { error: '122' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      ViewPipelineUpdater.initialize();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveViewPipeline')).to.equal(true);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.calledWithExactly($('#cmbCollectionsUpdateViewPipeline'))).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'listCollectionNames',
        args: { dbName },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, result)).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#updateViewPipelineModal');
      expect(jsonEditorStub.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(0);
    });

    it('initialize & communicator yields success & collection not found', () => {
      // prepare
      const result = { result: [{ name: 'sercan', options: { pipeline: 'SERCAN' } }] };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      ViewPipelineUpdater.initialize();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveViewPipeline')).to.equal(true);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.calledWithExactly($('#cmbCollectionsUpdateViewPipeline'))).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'listCollectionNames',
        args: { dbName },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#updateViewPipelineModal');
      expect(jsonEditorStub.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.warning.callCount).to.equal(1);
      expect(Notification.warning.calledWithExactly('collection-not-found', null, { name: viewName })).to.equal(true);
    });

    it('initialize & communicator yields success & collection found', () => {
      // prepare
      const pipeline = 'SERCAN';
      const result = { result: [{ name: 'sercan', options: { pipeline: 'TUGCE' } }, { name: viewName, options: { pipeline } }] };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      ViewPipelineUpdater.initialize();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveViewPipeline')).to.equal(true);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.calledWithExactly($('#cmbCollectionsUpdateViewPipeline'))).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'listCollectionNames',
        args: { dbName },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(0);
      expect(jsonEditorStub.set.callCount).to.equal(1);
      expect(jsonEditorStub.set.calledWithExactly(pipeline)).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.warning.callCount).to.equal(0);
    });
  });
});
