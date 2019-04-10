/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { ErrorHandler, Notification, UIComponents } from '/client/imports/modules';
import { CollectionRename } from '/client/imports/ui/collection';
import { Connection } from '/client/imports/ui';
import { Communicator } from '/client/imports/facades';

describe('CollectionRename', () => {
  describe('resetForm tests', () => {
    const collectionName = 'collectionNAME';

    beforeEach(() => {
      sinon.stub($.prototype, 'val');
      sinon.stub($.prototype, 'html');
      sinon.stub($.prototype, 'data').returns(collectionName);
    });

    afterEach(() => {
      $.prototype.val.restore();
      $.prototype.html.restore();
      $.prototype.data.restore();
    });

    it('resetForm', () => {
      // prepare

      // execute
      CollectionRename.resetForm();

      // verify
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly('')).to.equal(true);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#inputRenameName');
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(collectionName)).to.equal(true);
      expect($.prototype.html.getCall(0).thisValue.selector).to.equal('#spanCollectionNameRename');
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#renameCollectionModal');
    });
  });

  describe('rename tests', () => {
    const dropState = 'sercan';

    const assertValidationError = function () {
      expect(Communicator.call.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnRenameCollection')).to.equal(true);
      expect(Notification.warning.callCount).to.equal(1);
      expect($.prototype.modal.callCount).to.equal(0);
    };

    beforeEach(() => {
      sinon.stub(UIComponents.Checkbox, 'getState').returns(dropState);
      sinon.stub(Notification, 'success');
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'warning');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub($.prototype, 'modal');
    });

    afterEach(() => {
      $.prototype.val.restore();
      $.prototype.data.restore();
      $.prototype.modal.restore();
      UIComponents.Checkbox.getState.restore();
      Notification.success.restore();
      Notification.start.restore();
      Notification.warning.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
    });

    it('rename with no newName', () => {
      // prepare
      const newName = '';
      const selectedCollection = 'tugce';
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.spy(Communicator, 'call');

      // execute
      CollectionRename.rename();

      // verify
      assertValidationError();
      expect(Notification.warning.calledWithExactly('name-required')).to.equal(true);
    });

    it('rename with no selected collection', () => {
      // prepare
      const newName = 'sercan';
      const selectedCollection = '';
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.spy(Communicator, 'call');

      // execute
      CollectionRename.rename();

      // verify
      assertValidationError();
      expect(Notification.warning.calledWithExactly('collection-not-found')).to.equal(true);
    });

    it('rename with selected collection == newName', () => {
      // prepare
      const newName = 'sercan';
      const selectedCollection = 'sercan';
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.spy(Communicator, 'call');

      // execute
      CollectionRename.rename();

      // verify
      assertValidationError();
      expect(Notification.warning.calledWithExactly('name-same-with-old')).to.equal(true);
    });

    it('rename communicatior yields to error', () => {
      // prepare
      const newName = 'sercan';
      const selectedCollection = 'tugce';
      const error = { error: '2009' };
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);

      // execute
      CollectionRename.rename();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnRenameCollection')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'rename',
        args: { selectedCollection, newName, options: { dropTarget: dropState } },
        callback: sinon.match.func
      }
      )).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(0);
    });

    it('rename communicatior yields to error (1)', () => {
      // prepare
      const newName = 'sercan';
      const selectedCollection = 'tugce';
      const error = { error: '2009' };
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);

      // execute
      CollectionRename.rename();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnRenameCollection')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'rename',
        args: { selectedCollection, newName, options: { dropTarget: dropState } },
        callback: sinon.match.func
      }
      )).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(0);
    });

    it('rename communicatior yields to success', () => {
      // prepare
      const newName = 'sercan';
      const selectedCollection = 'tugce';
      const result = { sucess: true };
      sinon.stub($.prototype, 'val').returns(newName);
      sinon.stub($.prototype, 'data').returns(selectedCollection);
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      CollectionRename.rename();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnRenameCollection')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'rename',
        args: { selectedCollection, newName, options: { dropTarget: dropState } },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-renamed-successfully', null, { name: newName })).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(false)).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#renameCollectionModal');
    });
  });
});
