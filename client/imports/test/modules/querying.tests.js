/* eslint-env mocha */

import { ReactivityProvider, Communicator } from '/client/imports/facades';
import { Querying, SessionManager, ErrorHandler, Notification } from '/client/imports/modules';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * showMeteorFuncError will be tested in Notification tests since it's only a proxy.
 */
describe('Querying', () => {
  const error = { error: '1009', reason: 'failed' };

  describe('getDistinctKeysForAutoComplete selectedCollection valid tests', () => {
    const collectionCountError = 'collection-1';
    const collectionCountError2 = 'collection-2';
    const collectionFindError = 'collection-3';
    const collectionFindError2 = 'collection-4';
    const collectionSuccess = 'collection-5';

    beforeEach(() => {
      sinon.stub(ReactivityProvider, 'findOne').returns({
        autoCompleteSamplesCount: 50
      });

      sinon.stub(Communicator, 'call')
        .withArgs(sinon.match({ methodName: 'count', args: { selectedCollection: collectionCountError } }))
        .yieldsTo('callback', error)
        .withArgs(sinon.match({ methodName: 'count', args: { selectedCollection: collectionCountError2 } }))
        .yieldsTo('callback', null, error)
        .withArgs(sinon.match({ methodName: 'count', args: { selectedCollection: collectionFindError } }))
        .yieldsTo('callback', null, { result: 10 })
        .withArgs(sinon.match({ methodName: 'count', args: { selectedCollection: collectionFindError2 } }))
        .yieldsTo('callback', null, { result: 10 })
        .withArgs(sinon.match({ methodName: 'count', args: { selectedCollection: collectionSuccess } }))
        .yieldsTo('callback', null, { result: 10 })
        .withArgs(sinon.match({ methodName: 'find', args: { selectedCollection: collectionFindError } }))
        .yieldsTo('callback', error)
        .withArgs(sinon.match({ methodName: 'find', args: { selectedCollection: collectionFindError2 } }))
        .yieldsTo('callback', null, error)
        .withArgs(sinon.match({ methodName: 'find', args: { selectedCollection: collectionSuccess } }))
        .yieldsTo('callback', null, { result: [{ a: 123, b: true, c: 'sercan' }, { a: 21, b: false }, { d: 33 }] });
      sinon.spy(SessionManager, 'set');
      sinon.spy(ErrorHandler, 'showMeteorFuncError');
      sinon.spy(Notification, 'stop');
    });

    afterEach(() => {
      ReactivityProvider.findOne.restore();
      SessionManager.set.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.stop.restore();
      Communicator.call.restore();
    });

    it('count method fails with error (first callback arg)', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionCountError);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'count',
        args: { selectedCollection: collectionCountError }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error)).to.equal(true);
    });

    it('count method fails with error (second callback arg)', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionCountError2);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'count',
        args: { selectedCollection: collectionCountError2 }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(null, error)).to.equal(true);
    });

    it('find method fails with error (first callback arg)', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionFindError);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(2);
      expect(Communicator.call.getCall(0).calledWithMatch({
        methodName: 'count',
        args: { selectedCollection: collectionFindError }
      })).to.equal(true);
      expect(Communicator.call.getCall(1).calledWithMatch({
        methodName: 'find',
        args: { selectedCollection: collectionFindError }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error)).to.equal(true);
    });

    it('find method fails with error (second callback arg)', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionFindError2);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(2);
      expect(Communicator.call.getCall(0).calledWithMatch({
        methodName: 'count',
        args: { selectedCollection: collectionFindError2 }
      })).to.equal(true);
      expect(Communicator.call.getCall(1).calledWithMatch({
        methodName: 'find',
        args: { selectedCollection: collectionFindError2 }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(null, error)).to.equal(true);
    });

    it('normal behaviour', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionSuccess);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(2);
      expect(Communicator.call.getCall(0).calledWithMatch(sinon.match({
        methodName: 'count',
        args: { selectedCollection: collectionSuccess }
      }))).to.equal(true);
      expect(Communicator.call.getCall(1).calledWithMatch(sinon.match({
        methodName: 'find',
        args: { selectedCollection: collectionSuccess }
      }))).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionDistinctFields, ['a', 'b', 'c', 'd'])).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    });
  });

  describe('getDistinctKeysForAutoComplete selectedCollection not valid & settings empty tests', () => {
    beforeEach(() => {
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);
      sinon.stub(ReactivityProvider, 'findOne').returns({});
      sinon.spy(SessionManager, 'set');
      sinon.spy(ErrorHandler, 'showMeteorFuncError');
      sinon.spy(Notification, 'stop');
    });

    afterEach(() => {
      ReactivityProvider.findOne.restore();
      SessionManager.set.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.stop.restore();
      Communicator.call.restore();
    });

    it('selectedCollection param empty', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete();

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionDistinctFields, [])).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    });

    it('selectedCollection param ends with .chunks', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete('myCollection.chunks');

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionDistinctFields, [])).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    });

    it('settings empty', () => {
      // prepare

      // execute
      Querying.getDistinctKeysForAutoComplete('goodCollection');

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch(sinon.match({
        methodName: 'count',
        args: { selectedCollection: 'goodCollection' }
      }))).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(sinon.match(error))).to.equal(true);
    });
  });
});
