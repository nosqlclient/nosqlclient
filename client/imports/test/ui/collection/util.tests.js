/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionUtil, Connection } from '/client/imports/ui';
import { ErrorHandler, Notification, SessionManager } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
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
});
