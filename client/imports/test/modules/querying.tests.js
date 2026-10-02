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
    const collectionSampleError = 'collection-1';
    const collectionSampleError2 = 'collection-2';
    const collectionSuccess = 'collection-3';
    const samplePipeline = [{ $sample: { size: 50 } }];
    let selectedCollection;

    beforeEach(() => {
      selectedCollection = null;
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionSelectedCollection).callsFake(() => selectedCollection);
      sinon.stub(ReactivityProvider, 'findOne').returns({
        autoCompleteSamplesCount: 50
      });

      sinon.stub(Communicator, 'call')
        .withArgs(sinon.match({ methodName: 'aggregate', args: { selectedCollection: collectionSampleError } }))
        .yieldsTo('callback', error)
        .withArgs(sinon.match({ methodName: 'aggregate', args: { selectedCollection: collectionSampleError2 } }))
        .yieldsTo('callback', null, error)
        .withArgs(sinon.match({ methodName: 'aggregate', args: { selectedCollection: collectionSuccess } }))
        .yieldsTo('callback', null, { result: [{ a: 123, b: true, c: 'sercan' }, { a: 21, b: false }, { d: 33 }] });
      sinon.spy(SessionManager, 'set');
      sinon.spy(ErrorHandler, 'showMeteorFuncError');
      sinon.spy(Notification, 'stop');
    });

    afterEach(() => {
      SessionManager.get.restore();
      ReactivityProvider.findOne.restore();
      SessionManager.set.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.stop.restore();
      Communicator.call.restore();
    });

    it('sample aggregation fails with error (first callback arg)', () => {
      // prepare
      selectedCollection = collectionSampleError;

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionSampleError);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection: collectionSampleError, pipeline: samplePipeline }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error)).to.equal(true);
    });

    it('sample aggregation fails with error (second callback arg)', () => {
      // prepare
      selectedCollection = collectionSampleError2;

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionSampleError2);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection: collectionSampleError2, pipeline: samplePipeline }
      })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(null, error)).to.equal(true);
    });

    it('normal behaviour', () => {
      // prepare
      selectedCollection = collectionSuccess;

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionSuccess);

      // verify
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Settings)).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch(sinon.match({
        methodName: 'aggregate',
        args: { selectedCollection: collectionSuccess, pipeline: samplePipeline }
      }))).to.equal(true);
      expect(Communicator.call.calledWithMatch(sinon.match({ methodName: 'count' }))).to.equal(false);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionDistinctFields, ['a', 'b', 'c', 'd'])).to.equal(true);
      expect(Notification.stop.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    });

    it('ignores samples that arrive after the user selected another collection', () => {
      // prepare
      selectedCollection = 'another-collection';

      // execute
      Querying.getDistinctKeysForAutoComplete(collectionSuccess);

      // verify
      expect(Communicator.call.callCount).to.equal(1);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    });
  });

  describe('getDistinctKeysForAutoComplete selectedCollection not valid & settings empty tests', () => {
    beforeEach(() => {
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionSelectedCollection).returns('goodCollection');
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);
      sinon.stub(ReactivityProvider, 'findOne').returns({});
      sinon.spy(SessionManager, 'set');
      sinon.spy(ErrorHandler, 'showMeteorFuncError');
      sinon.spy(Notification, 'stop');
    });

    afterEach(() => {
      SessionManager.get.restore();
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
      expect(Notification.stop.callCount).to.equal(0);
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
      expect(Notification.stop.callCount).to.equal(0);
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
        methodName: 'aggregate',
        args: { selectedCollection: 'goodCollection', pipeline: [{ $sample: { size: 50 } }] }
      }))).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(sinon.match(error))).to.equal(true);
    });
  });
});
