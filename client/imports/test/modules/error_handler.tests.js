/* eslint-env mocha */

import { ErrorHandler } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import sinon from 'sinon';
import { expect } from 'chai';


/**
 * showMeteorFuncError will be tested in Notification tests since it's only a proxy.
 */
describe('ErrorHandler', () => {
  const reason = 'myReason';
  const detailsMessage = 'detailsMessage';

  before(() => {
    sinon.stub(Helper, 'translate')
      .withArgs(sinon.match({ key: 'unknown-error' }))
      .returns('unknown error')
      .withArgs(sinon.match({ key: reason }))
      .returns(reason)
      .withArgs(sinon.match({ key: detailsMessage }))
      .returns(detailsMessage);
  });

  after(() => {
    Helper.translate.restore();
  });

  describe('getErrorMessage tests', () => {
    it('error filled, result is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ error: '1009', reason }, null, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${reason}`);
    });

    it('error filled with details but no message, result is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ error: '1009', details: {}, reason }, null, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${reason}`);
    });

    it('error filled with details, result is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ error: '1009', details: { message: detailsMessage }, reason }, null, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${detailsMessage}`);
    });

    it('error filled with details, result filled (error has prio)', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ error: '1009', details: { message: detailsMessage }, reason }, { error: { message: reason } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${detailsMessage}`);
    });

    it('error filled without details, result filled (error has prio)', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ error: '1009', reason }, { error: { message: detailsMessage } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${reason}`);
    });

    it('result filled without details, error is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, { error: { error: '1009', message: detailsMessage } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${detailsMessage}`);
    });

    it('result filled with details (details has prio), error is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, { error: { error: '1009', message: reason, details: { message: detailsMessage } } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${detailsMessage}`);
    });

    it('result filled with wrong details, error is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, { error: { error: '1009', message: reason, details: { msg: detailsMessage } } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${reason}`);
    });

    it('result filled with message & errmsg (message has prio), error is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, { error: { error: '1009', message: reason, errMsg: detailsMessage } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${reason}`);
    });

    it('result filled with errmsg, error is null', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, { error: { error: '1009', errmsg: detailsMessage } }, null);

      // verify
      expect(errorMessage).to.equal(`[1009] ${detailsMessage}`);
    });

    it('result & error empty', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage(null, null, null);

      // verify
      expect(errorMessage).to.equal('unknown error');
    });
  });
});
