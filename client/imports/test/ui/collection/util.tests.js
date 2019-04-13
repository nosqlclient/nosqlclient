/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionAdd, CollectionConversion, CollectionFilter, CollectionRename, CollectionUtil, CollectionValidationRules, Connection, ViewPipelineUpdater } from '/client/imports/ui';
import { Enums, ErrorHandler, Notification, Querying, SessionManager } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import $ from 'jquery';

describe('CollectionUtil', () => {
  describe('setSessionForNavigation tests', () => {
    beforeEach(() => {
      sinon.stub(SessionManager, 'set');
    });

    afterEach(() => {
      SessionManager.set.restore();

      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('setSessionForNavigation with name exist', () => {
      // prepare
      const selectedName = 'Sercan';
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.setSessionForNavigation(selectedName);

      // verify
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, selectedName)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(true);
      expect($('#tugce').hasClass('active')).to.equal(false);
    });

    it('setSessionForNavigation with name not exist', () => {
      // prepare
      const selectedName = 'not_exist';
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.setSessionForNavigation(selectedName);

      // verify
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, selectedName)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(false);
      expect($('#tugce').hasClass('active')).to.equal(false);
    });
  });

  describe('dropDatabase tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(SessionManager, 'clear');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      SessionManager.clear.restore();
      Notification.success.restore();
    });

    it('dropDatabase & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('database-dropped-successfully')).to.equal(true);
      expect(SessionManager.clear.callCount).to.equal(1);
      expect(SessionManager.clear.calledWithExactly()).to.equal(true);
    });
  });

  describe('dropDatabase tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(SessionManager, 'clear');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      SessionManager.clear.restore();
      Notification.success.restore();
    });

    it('dropDatabase & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('database-dropped-successfully')).to.equal(true);
      expect(SessionManager.clear.callCount).to.equal(1);
      expect(SessionManager.clear.calledWithExactly()).to.equal(true);
    });
  });

  describe('dropAllCollections tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.success.restore();
    });

    it('dropAllCollections & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('dropped-all-collections-successfully')).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(false)).to.equal(true);
    });
  });

  describe('dropCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.success.restore();
    });

    it('dropCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropCollection & no confirmation', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-dropped-successfully', null, { selectedCollection })).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(false)).to.equal(true);
    });
  });

  describe('cloneCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'closeModal');
      sinon.stub(Notification, 'showModalInputError');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.closeModal.restore();
      Notification.showModalInputError.restore();
    });

    it('cloneCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.cloneCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('cloneCollection & no input', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal').yieldsTo('callback');

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(1);
      expect(Notification.showModalInputError.calledWithExactly('name-required')).to.equal(true);
    });

    it('cloneCollection & input & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.closeModal.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });

    it('cloneCollection & input & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.closeModal.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });

    it('cloneCollection & input & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.closeModal.callCount).to.equal(1);
      expect(Notification.closeModal.calledWithExactly()).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(true, 'collection-cloned-successfully', { selectedCollection, name: input })).to.equal(true);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });
  });

  describe('showMongoBinaryInfo tests', () => {
    beforeEach(() => {
      sinon.stub(localStorage, 'setItem');
    });

    afterEach(() => {
      Notification.modal.restore();
      localStorage.setItem.restore();
      localStorage.getItem.restore();
    });

    it('showMongoBinaryInfo & localstorage item exist', () => {
      // prepare
      sinon.spy(Notification, 'modal');
      sinon.stub(localStorage, 'getItem').returns(true);

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(localStorage.setItem.callCount).to.equal(0);
    });

    it('showMongoBinaryInfo & localstorage item does not exist & no confirmation', () => {
      // prepare
      sinon.stub(Notification, 'modal').yieldsTo('callback', false);
      sinon.stub(localStorage, 'getItem').returns();

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'mongo-tools',
        text: 'mongo-tools-info',
        type: 'info',
        confirmButtonText: 'dont_show_again',
        callback: sinon.match.func
      })).to.equal(true);
      expect(localStorage.setItem.callCount).to.equal(0);
    });

    it('showMongoBinaryInfo & localstorage item does not exist & confirmation', () => {
      // prepare
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);
      sinon.stub(localStorage, 'getItem').returns();

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'mongo-tools',
        text: 'mongo-tools-info',
        type: 'info',
        confirmButtonText: 'dont_show_again',
        callback: sinon.match.func
      })).to.equal(true);
      expect(localStorage.setItem.callCount).to.equal(1);
      expect(localStorage.setItem.calledWithExactly(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO, 'true')).to.equal(true);
    });
  });

  describe('clearCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.success.restore();
    });

    it('clearCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.clearCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('clearCollection & no confirmation', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-cleared-successfully', null, { selectedCollection })).to.equal(true);
    });
  });

  describe('handleNavigationAndSessions tests', () => {
    let valStub;
    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };
      sinon.stub(SessionManager, 'set');
      sinon.stub($.prototype, 'val').returns(valStub);
    });

    afterEach(() => {
      SessionManager.set.restore();
      $.prototype.val.restore();

      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('handleNavigationAndSessions', () => {
      // prepare
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>'
        + '<ul id="listSystemCollections" class="nav nav-second-level">'
        + '<li class="active" id="1">1</li>'
        + '<li class="active" id="2">2</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.handleNavigationAndSessions();

      // verify
      expect(SessionManager.set.callCount).to.equal(3);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, null)).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedQuery, null)).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedOptions, null)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(false);
      expect($('#1').hasClass('active')).to.equal(false);
      expect($('#2').hasClass('active')).to.equal(false);
      expect($('#tugce').hasClass('active')).to.equal(false);
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#cmbQueries');
      expect($.prototype.val.getCall(1).thisValue.selector).to.equal('#cmbAdminQueries');
      expect($.prototype.val.alwaysCalledWithExactly('')).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(2);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
    });
  });

  describe('prepareContextMenuItems tests', () => {
    const collectionName = 'sercanCol';
    const hrefId = 'TESTTTT';

    beforeEach(() => {
      const href = document.createElement('a');
      href.setAttribute('id', hrefId);
      href.innerText = collectionName;

      document.body.append(href);
    });

    afterEach(() => {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('prepareContextMenuItems item existance', () => {
      // prepare

      // execute
      const items = CollectionUtil.prepareContextMenuItems({});

      // verify
      expect(items).to.have.property('manage_collection');
      expect(items).to.have.property('update_view_pipeline');
      expect(items).to.have.property('add_collection');
      expect(items).to.have.property('filter_collections');
      expect(items).to.have.property('clear_filter');
      expect(items).to.have.property('refresh_collections');
      expect(items).to.have.property('drop_collection');
      expect(items).to.have.property('drop_collections');
      expect(items.manage_collection.items).to.have.property('view_collection');
      expect(items.manage_collection.items).to.have.property('convert_to_capped');
      expect(items.manage_collection.items).to.have.property('rename_collection');
      expect(items.manage_collection.items).to.have.property('clone_collection');
      expect(items.manage_collection.items).to.have.property('validation_rules');
      expect(items.manage_collection.items).to.have.property('clear_collection');
    });

    it('prepareContextMenuItems manage_collection.view_collection callback', () => {
      // prepare
      const addCollectionModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ addCollectionModal });
      items.manage_collection.items.view_collection.callback.call(document.getElementById(hrefId));

      // verify
      expect(addCollectionModal.data.callCount).to.equal(1);
      expect(addCollectionModal.data.calledWithExactly('is-view', collectionName)).to.equal(true);
      expect(addCollectionModal.modal.callCount).to.equal(1);
      expect(addCollectionModal.modal.calledWithMatch({ backdrop: 'static', keyboard: false, })).to.equal(true);
    });

    it('prepareContextMenuItems manage_collection.convert_to_capped callback', () => {
      // prepare
      const convertToCappedModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ convertToCappedModal });
      items.manage_collection.items.convert_to_capped.callback.call(document.getElementById(hrefId));

      // verify
      expect(convertToCappedModal.data.callCount).to.equal(1);
      expect(convertToCappedModal.data.calledWithExactly('collection', collectionName)).to.equal(true);
      expect(convertToCappedModal.modal.callCount).to.equal(1);
      expect(convertToCappedModal.modal.calledWithMatch('show')).to.equal(true);
    });

    it('prepareContextMenuItems manage_collection.rename_collection callback', () => {
      // prepare
      const renameModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ renameModal });
      items.manage_collection.items.rename_collection.callback.call(document.getElementById(hrefId));

      // verify
      expect(renameModal.data.callCount).to.equal(1);
      expect(renameModal.data.calledWithExactly('collection', collectionName)).to.equal(true);
      expect(renameModal.modal.callCount).to.equal(1);
      expect(renameModal.modal.calledWithMatch('show')).to.equal(true);
    });

    it('prepareContextMenuItems manage_collection.clone_collection callback', () => {
      // prepare
      sinon.stub(CollectionUtil, 'cloneCollection');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.manage_collection.items.clone_collection.callback.call(document.getElementById(hrefId));

      // verify
      expect(CollectionUtil.cloneCollection.callCount).to.equal(1);
      expect(CollectionUtil.cloneCollection.calledWithExactly(collectionName)).to.equal(true);

      // cleanup
      CollectionUtil.cloneCollection.restore();
    });

    it('prepareContextMenuItems manage_collection.validation_rules callback', () => {
      // prepare
      const validationRulesModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ validationRulesModal });
      items.manage_collection.items.validation_rules.callback.call(document.getElementById(hrefId));

      // verify
      expect(validationRulesModal.data.callCount).to.equal(1);
      expect(validationRulesModal.data.calledWithExactly('collection', collectionName)).to.equal(true);
      expect(validationRulesModal.modal.callCount).to.equal(1);
      expect(validationRulesModal.modal.calledWithMatch('show')).to.equal(true);
    });

    it('prepareContextMenuItems manage_collection.clear_collection callback with selected', () => {
      // prepare
      sinon.stub(CollectionUtil, 'clearCollection');
      sinon.stub(Notification, 'warning');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.manage_collection.items.clear_collection.callback.call(document.getElementById(hrefId));

      // verify
      expect(CollectionUtil.clearCollection.callCount).to.equal(1);
      expect(CollectionUtil.clearCollection.calledWithExactly(collectionName)).to.equal(true);
      expect(Notification.warning.callCount).to.equal(0);

      // cleanup
      CollectionUtil.clearCollection.restore();
      Notification.warning.restore();
    });

    it('prepareContextMenuItems manage_collection.clear_collection callback with no selected', () => {
      // prepare
      sinon.stub(CollectionUtil, 'clearCollection');
      sinon.stub(Notification, 'warning');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.manage_collection.items.clear_collection.callback.call();

      // verify
      expect(CollectionUtil.clearCollection.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(1);
      expect(Notification.warning.calledWithExactly('select_collection')).to.equal(true);

      // cleanup
      CollectionUtil.clearCollection.restore();
      Notification.warning.restore();
    });

    it('prepareContextMenuItems update_view_pipeline callback', () => {
      // prepare
      const updateViewPipeline = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ updateViewPipeline });
      items.update_view_pipeline.callback.call(document.getElementById(hrefId));

      // verify
      expect(updateViewPipeline.data.callCount).to.equal(1);
      expect(updateViewPipeline.data.calledWithExactly('viewName', collectionName)).to.equal(true);
      expect(updateViewPipeline.modal.callCount).to.equal(1);
      expect(updateViewPipeline.modal.calledWithMatch('show')).to.equal(true);
    });

    it('prepareContextMenuItems add_collection callback', () => {
      // prepare
      const addCollectionModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ addCollectionModal });
      items.add_collection.callback();

      // verify
      expect(addCollectionModal.data.callCount).to.equal(1);
      expect(addCollectionModal.data.calledWithExactly('is-view', '')).to.equal(true);
      expect(addCollectionModal.modal.callCount).to.equal(1);
      expect(addCollectionModal.modal.calledWithMatch({ backdrop: 'static', keyboard: false })).to.equal(true);
    });

    it('prepareContextMenuItems clear_filter callback', () => {
      // prepare
      sinon.stub(CollectionFilter.excludedCollectionsByFilter, 'set');
      sinon.stub(CollectionFilter.filterRegex, 'set');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.clear_filter.callback();

      // verify
      expect(CollectionFilter.excludedCollectionsByFilter.set.callCount).to.equal(1);
      expect(CollectionFilter.excludedCollectionsByFilter.set.calledWithExactly([])).to.equal(true);
      expect(CollectionFilter.filterRegex.set.callCount).to.equal(1);
      expect(CollectionFilter.filterRegex.set.calledWithExactly('')).to.equal(true);

      // cleanup
      CollectionFilter.excludedCollectionsByFilter.set.restore();
      CollectionFilter.filterRegex.set.restore();
    });

    it('prepareContextMenuItems refresh_collections callback', () => {
      // prepare
      sinon.stub(Connection, 'connect');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.refresh_collections.callback();

      // verify
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(true)).to.equal(true);

      // cleanup
      Connection.connect.restore();
    });

    it('prepareContextMenuItems drop_collection callback with selected', () => {
      // prepare
      sinon.stub(CollectionUtil, 'dropCollection');
      sinon.stub(Notification, 'warning');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.drop_collection.callback.call(document.getElementById(hrefId));

      // verify
      expect(CollectionUtil.dropCollection.callCount).to.equal(1);
      expect(CollectionUtil.dropCollection.calledWithExactly(collectionName)).to.equal(true);
      expect(Notification.warning.callCount).to.equal(0);

      // cleanup
      CollectionUtil.dropCollection.restore();
      Notification.warning.restore();
    });

    it('prepareContextMenuItems drop_collection callback with no selected', () => {
      // prepare
      sinon.stub(CollectionUtil, 'dropCollection');
      sinon.stub(Notification, 'warning');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.drop_collection.callback.call();

      // verify
      expect(CollectionUtil.dropCollection.callCount).to.equal(0);
      expect(Notification.warning.callCount).to.equal(1);
      expect(Notification.warning.calledWithExactly('select_collection')).to.equal(true);

      // cleanup
      CollectionUtil.dropCollection.restore();
      Notification.warning.restore();
    });

    it('prepareContextMenuItems drop_collections callback', () => {
      // prepare
      sinon.stub(CollectionUtil, 'dropAllCollections');

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ });
      items.drop_collections.callback();

      // verify
      expect(CollectionUtil.dropAllCollections.callCount).to.equal(1);
      expect(CollectionUtil.dropAllCollections.calledWithExactly()).to.equal(true);

      // cleanup
      CollectionUtil.dropAllCollections.restore();
    });
  });

  describe('getCollectionInformation tests', () => {
    let clock;
    const errorMessage = 'error !!!';
    const errorDetails = 'error details !!';

    const assertNoExecution = function (sessionManagerCall) {
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(SessionManager.get.callCount).to.equal(sessionManagerCall ? 1 : 0);
      if (sessionManagerCall) expect(SessionManager.get.calledWithExactly(SessionManager.strSessionSelectedCollection)).to.equal(true);
      expect(Querying.getDistinctKeysForAutoComplete.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
      expect($.prototype.html.callCount).to.equal(0);
      expect(CollectionUtil.populateCollectionInfo.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(ErrorHandler.getErrorMessage.callCount).to.equal(0);
    };

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      sinon.stub($.prototype, 'html');
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub(Querying, 'getDistinctKeysForAutoComplete');
      sinon.stub(CollectionUtil, 'populateCollectionInfo');
      sinon.stub(Helper, 'translate').withArgs({ key: 'fetch_stats_error' }).returns(errorMessage);
      sinon.stub(ErrorHandler, 'getErrorMessage').returns(errorDetails);
    });

    afterEach(() => {
      clock.restore();
      $.prototype.html.restore();
      document.querySelector.restore();
      ReactivityProvider.findOne.restore();
      Notification.start.restore();
      Notification.stop.restore();
      SessionManager.get.restore();
      Querying.getDistinctKeysForAutoComplete.restore();
      Communicator.call.restore();
      CollectionUtil.populateCollectionInfo.restore();
      Helper.translate.restore();
      ErrorHandler.getErrorMessage.restore();
    });

    it('getCollectionInformation with no tick', () => {
      // prepare
      sinon.stub(document, 'querySelector');
      sinon.stub(ReactivityProvider, 'findOne');
      sinon.stub(SessionManager, 'get');
      sinon.stub(Communicator, 'call');

      // execute
      CollectionUtil.getCollectionInformation();

      // verify
      assertNoExecution();
    });

    it('getCollectionInformation with tick & no settings', () => {
      // prepare
      sinon.stub(document, 'querySelector');
      sinon.stub(ReactivityProvider, 'findOne');
      sinon.stub(SessionManager, 'get');
      sinon.stub(Communicator, 'call');

      // execute
      CollectionUtil.getCollectionInformation();
      clock.tick(150);

      // verify
      assertNoExecution();
    });

    it('getCollectionInformation with tick & no btnExecuteQuery', () => {
      // prepare
      const settings = { a: 1, b: 2, c: true };
      sinon.stub(document, 'querySelector');
      sinon.stub(ReactivityProvider, 'findOne').returns(settings);
      sinon.stub(SessionManager, 'get');
      sinon.stub(Communicator, 'call');

      // execute
      CollectionUtil.getCollectionInformation();
      clock.tick(150);

      // verify
      assertNoExecution();
    });

    it('getCollectionInformation with tick & no selectedCollection', () => {
      // prepare
      const settings = { a: 1, b: 2, c: true };
      sinon.stub(document, 'querySelector').returns('something');
      sinon.stub(ReactivityProvider, 'findOne').returns(settings);
      sinon.stub(SessionManager, 'get');
      sinon.stub(Communicator, 'call');

      // execute
      CollectionUtil.getCollectionInformation();
      clock.tick(150);

      // verify
      assertNoExecution(true);
    });

    it('getCollectionInformation with tick & communicator yields error', () => {
      // prepare
      const settings = { a: 1, b: 2, c: true };
      const selectedCollection = 'sercanCollection';
      const error = { error: '123' };
      sinon.stub(document, 'querySelector').returns('something');
      sinon.stub(ReactivityProvider, 'findOne').returns(settings);
      sinon.stub(SessionManager, 'get').returns(selectedCollection);
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);

      // execute
      CollectionUtil.getCollectionInformation();
      clock.tick(150);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(SessionManager.get.callCount).to.equal(1);
      expect(SessionManager.get.calledWithExactly(SessionManager.strSessionSelectedCollection)).to.equal(true);
      expect(Querying.getDistinctKeysForAutoComplete.callCount).to.equal(1);
      expect(Querying.getDistinctKeysForAutoComplete.calledWithExactly(selectedCollection)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'stats', args: { selectedCollection }, callback: sinon.match.func })).to.equal(true);
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(`<div class="row"><div class="col-lg-7"><b>${errorMessage}</b></div><div class="col-lg-5">${errorDetails}</div></div>`)).to.equal(true);
      expect(CollectionUtil.populateCollectionInfo.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnExecuteQuery')).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(ErrorHandler.getErrorMessage.callCount).to.equal(1);
      expect(ErrorHandler.getErrorMessage.calledWithExactly(error, null)).to.equal(true);
    });

    it('getCollectionInformation with tick & communicator yields success', () => {
      // prepare
      const settings = { a: 1, b: 2, c: true };
      const selectedCollection = 'sercanCollection';
      const result = { result: '123' };
      sinon.stub(document, 'querySelector').returns('something');
      sinon.stub(ReactivityProvider, 'findOne').returns(settings);
      sinon.stub(SessionManager, 'get').returns(selectedCollection);
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      CollectionUtil.getCollectionInformation();
      clock.tick(150);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(SessionManager.get.callCount).to.equal(1);
      expect(SessionManager.get.calledWithExactly(SessionManager.strSessionSelectedCollection)).to.equal(true);
      expect(Querying.getDistinctKeysForAutoComplete.callCount).to.equal(1);
      expect(Querying.getDistinctKeysForAutoComplete.calledWithExactly(selectedCollection)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'stats', args: { selectedCollection }, callback: sinon.match.func })).to.equal(true);
      expect($.prototype.html.callCount).to.equal(0);
      expect(CollectionUtil.populateCollectionInfo.callCount).to.equal(1);
      expect(CollectionUtil.populateCollectionInfo.calledWithExactly(result.result, settings)).to.equal(true);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnExecuteQuery')).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(ErrorHandler.getErrorMessage.callCount).to.equal(0);
    });
  });

  describe('populateCollectionInfo tests', () => {
    const count = 'count_translated';
    const indexCount = 'index_count_translated';
    const size = 'size_translated';
    const totalIndexSize = 'total_index_size_translated';
    const averageObjectSize = 'avg_obj_size_translated';
    const isCapped = 'is_capped_translate';
    const scaleTextResult = { scale: 0.5, text: 'MB' };

    beforeEach(() => {
      sinon.stub(Helper, 'translate').withArgs({ key: 'count' }).returns(count).withArgs({ key: 'index_count' })
        .returns(indexCount)
        .withArgs({ key: 'size' })
        .returns(size)
        .withArgs({ key: 'total_index_size' })
        .returns(totalIndexSize)
        .withArgs({ key: 'avg_obj_size' })
        .returns(averageObjectSize)
        .withArgs({ key: 'is_capped' })
        .returns(isCapped);
      sinon.stub(Helper, 'getScaleAndText').returns(scaleTextResult);
      sinon.stub($.prototype, 'html');
    });

    afterEach(() => {
      Helper.translate.restore();
      Helper.getScaleAndText.restore();
      $.prototype.html.restore();
    });

    it('populateCollectionInfo invalid param', () => {
      // prepare

      // execute
      CollectionUtil.populateCollectionInfo();

      // verify
      expect($.prototype.html.callCount).to.equal(0);
      expect(Helper.translate.callCount).to.equal(0);
      expect(Helper.getScaleAndText.callCount).to.equal(0);
    });

    it('populateCollectionInfo invalid param (1)', () => {
      // prepare

      // execute
      CollectionUtil.populateCollectionInfo({ x: 1 });

      // verify
      expect($.prototype.html.callCount).to.equal(0);
      expect(Helper.translate.callCount).to.equal(0);
      expect(Helper.getScaleAndText.callCount).to.equal(0);
    });

    it('populateCollectionInfo valid param', () => {
      // prepare
      const statsResult = { count: 1, nindexes: 33, size: 12355, totalIndexSize: 3333, avgObjSize: 1641, capped: false };

      // execute
      CollectionUtil.populateCollectionInfo(statsResult, { something: 123 });

      // verify
      const sizeNum = (statsResult.size / scaleTextResult.scale).toFixed(2);
      const totalIndexNum = (statsResult.totalIndexSize / scaleTextResult.scale).toFixed(2);
      const avgObjNum = (statsResult.avgObjSize / scaleTextResult.scale).toFixed(2);

      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.getCall(0).args[0]).to.have.string(`<div class="row"><div class="col-lg-7"><b>${count}:</b></div><div class="col-lg-5">${statsResult.count}</div></div>`);
      expect($.prototype.html.getCall(0).args[0]).to.have.string(`<div class="row"><div class="col-lg-7"><b>${indexCount}:</b></div><div class="col-lg-5">${statsResult.nindexes}</div></div>`);
      expect($.prototype.html.getCall(0).args[0]).to.have.string(`<div class="row"><div class="col-lg-7"><b>${size}:</b></div><div class="col-lg-5">${sizeNum} ${scaleTextResult.text}</div></div>`);
      expect($.prototype.html.getCall(0).args[0]).to.have
        .string(`<div class="row"><div class="col-lg-7"><b>${totalIndexSize}:</b></div><div class="col-lg-5">${totalIndexNum} ${scaleTextResult.text}</div></div>`);
      expect($.prototype.html.getCall(0).args[0]).to.have
        .string(`<div class="row"><div class="col-lg-7"><b>${averageObjectSize}:</b></div><div class="col-lg-5">${avgObjNum} ${scaleTextResult.text}</div></div>`);
      expect($.prototype.html.getCall(0).args[0]).to.have.string(`<div class="row"><div class="col-lg-7"><b>${isCapped}:</b></div><div class="col-lg-5">${statsResult.capped}</div></div>`);
      expect(Helper.translate.callCount).to.equal(6);
    });
  });

  describe('prepareContextMenuModals tests', () => {
    const assertExecution = function (collection) {
      expect($.prototype.on.callCount).to.equal(6);
      expect($.prototype.on.alwaysCalledWithMatch('shown.bs.modal', sinon.match.func)).to.equal(true);
      expect(CollectionFilter.initializeFilterTable.callCount).to.equal(1);
      expect(CollectionFilter.initializeFilterTable.calledWithExactly()).to.equal(true);
      expect(CollectionAdd.resetForm.callCount).to.equal(1);
      expect(CollectionAdd.resetForm.calledWithExactly()).to.equal(true);
      expect(CollectionAdd.initializeForm.callCount).to.equal(collection ? 1 : 0);
      if (collection) expect(CollectionAdd.initializeForm.calledWithExactly(collection)).to.equal(true);
      expect(CollectionConversion.resetForm.callCount).to.equal(1);
      expect(CollectionConversion.resetForm.calledWithExactly()).to.equal(true);
      expect(CollectionRename.resetForm.callCount).to.equal(1);
      expect(CollectionRename.resetForm.calledWithExactly()).to.equal(true);
      expect(CollectionValidationRules.resetForm.callCount).to.equal(1);
      expect(CollectionValidationRules.resetForm.calledWithExactly()).to.equal(true);
      expect(ViewPipelineUpdater.resetForm.callCount).to.equal(1);
      expect(ViewPipelineUpdater.resetForm.calledWithExactly()).to.equal(true);
      expect(ViewPipelineUpdater.initialize.callCount).to.equal(1);
      expect(ViewPipelineUpdater.initialize.calledWithExactly()).to.equal(true);
    };

    beforeEach(() => {
      sinon.stub($.prototype, 'on').yields(null);
      sinon.stub(CollectionFilter, 'initializeFilterTable');
      sinon.stub(CollectionAdd, 'resetForm');
      sinon.stub(CollectionAdd, 'initializeForm');
      sinon.stub(CollectionConversion, 'resetForm');
      sinon.stub(CollectionRename, 'resetForm');
      sinon.stub(CollectionValidationRules, 'resetForm');
      sinon.stub(ViewPipelineUpdater, 'resetForm');
      sinon.stub(ViewPipelineUpdater, 'initialize');
    });

    afterEach(() => {
      $.prototype.on.restore();
      CollectionFilter.initializeFilterTable.restore();
      CollectionAdd.resetForm.restore();
      CollectionAdd.initializeForm.restore();
      CollectionConversion.resetForm.restore();
      CollectionRename.resetForm.restore();
      CollectionValidationRules.resetForm.restore();
      ViewPipelineUpdater.resetForm.restore();
      ViewPipelineUpdater.initialize.restore();
      $.prototype.data.restore();
    });

    it('prepareContextMenuModals view', () => {
      // prepare
      const collection = 'sercanCollection';
      sinon.stub($.prototype, 'data').withArgs('is-view').returns(collection); // then it's a view window not edit.

      // execute
      CollectionUtil.prepareContextMenuModals();

      // verify
      assertExecution(collection);
    });

    it('prepareContextMenuModals edit', () => {
      // prepare
      sinon.stub($.prototype, 'data').withArgs('is-view').returns();

      // execute
      CollectionUtil.prepareContextMenuModals();

      // verify
      assertExecution();
    });
  });

  describe('getCollectionNames tests', () => {
    afterEach(() => {
      SessionManager.get.restore();
    });

    it('getCollectionNames non-system & no filter', () => {
      // prepare
      const allCollections = [{ name: 'sercan' }, { name: 'system.users' }, { name: 'test' }, { name: 'tugce' }];
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionCollectionNames).returns(allCollections);

      // execute
      const names = CollectionUtil.getCollectionNames();

      // verify
      expect(names).to.eql([{ name: 'sercan' }, { name: 'test' }, { name: 'tugce' }]);
    });

    it('getCollectionNames non-system & filter', () => {
      // prepare
      const allCollections = [{ name: 'sercan' }, { name: 'system.users' }, { name: 'test' }, { name: 'tugce' }, { name: 'aaaabbbb' }];
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionCollectionNames).returns(allCollections);
      sinon.stub(CollectionFilter.filterRegex, 'get').returns('.*e.*');
      sinon.stub(CollectionFilter.excludedCollectionsByFilter, 'get').returns(['test', 'tugce']);

      // execute
      const names = CollectionUtil.getCollectionNames();

      // verify
      expect(names).to.eql([{ name: 'sercan' }]);

      // cleanup
      CollectionFilter.filterRegex.get.restore();
      CollectionFilter.excludedCollectionsByFilter.get.restore();
    });

    it('getCollectionNames system & filter', () => {
      // prepare
      const allCollections = [{ name: 'sercan' }, { name: 'system.users' }, { name: 'system.test' }, { name: 'tugce' }, { name: 'system.aaaabbbb' }];
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionCollectionNames).returns(allCollections);
      sinon.stub(CollectionFilter.filterRegex, 'get').returns('.*a.*');
      sinon.stub(CollectionFilter.excludedCollectionsByFilter, 'get').returns(['tugce', 'system.test']);

      // execute
      const names = CollectionUtil.getCollectionNames(true);

      // verify
      expect(names).to.eql([{ name: 'system.aaaabbbb' }]);

      // cleanup
      CollectionFilter.filterRegex.get.restore();
      CollectionFilter.excludedCollectionsByFilter.get.restore();
    });
  });
});
