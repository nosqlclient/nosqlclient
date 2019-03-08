/* eslint-env mocha */

import { Notification } from '/client/imports/modules';
import { expect } from 'meteor/practicalmeteor:chai';
import Helper from '/client/imports/helpers/helper';
import sinon from 'sinon';

const toastr = require('toastr');
const ladda = require('ladda');

describe('Notification', () => {
  const message = 'myMessage';
  const options = { timeout: 5000 };
  const invalidOptions = { ttttt: 33 };

  before(() => {
    sinon.stub(Helper, 'translate')
      .withArgs(sinon.match({ key: message }))
      .returns(`${message}-translated`)
      .withArgs(sinon.match({ key: 'unexpected-error' }))
      .returns('unexpected-error');
  });

  after(() => {
    Helper.translate.restore();
  });

  beforeEach(() => {
    sinon.spy(toastr, 'info');
    sinon.spy(toastr, 'success');
    sinon.spy(toastr, 'warning');
    sinon.spy(toastr, 'error');
    sinon.spy(ladda, 'stopAll');
  });

  afterEach(() => {
    toastr.info.restore();
    toastr.success.restore();
    toastr.warning.restore();
    toastr.error.restore();
    ladda.stopAll.restore();
  });

  describe('notify tests', () => {
    it('type & message filled', () => {
      // prepare

      // execute
      Notification.notify({ type: 'info', message });

      // verify
      expect(toastr.info.callCount).to.equal(1);
      expect(toastr.success.callCount).to.equal(0);
      expect(toastr.warning.callCount).to.equal(0);
      expect(toastr.error.callCount).to.equal(0);
      expect(ladda.stopAll.callCount).to.equal(0);
      expect(toastr.info.calledWithExactly(`${message}-translated`, undefined)).to.equal(true);
    });

    it('only type filled, message is empty', () => {
      // prepare

      // execute
      Notification.notify({ type: 'info' });

      // verify
      expect(toastr.info.callCount).to.equal(0);
      expect(toastr.success.callCount).to.equal(0);
      expect(toastr.warning.callCount).to.equal(0);
      expect(toastr.error.callCount).to.equal(1);
      expect(ladda.stopAll.callCount).to.equal(0);
      expect(toastr.error.calledWithExactly('unexpected-error', undefined)).to.equal(true);
    });

    it('type & message & valid options', () => {
      // prepare

      // execute
      Notification.notify({ type: 'info', message, options });

      // verify
      expect(toastr.info.callCount).to.equal(1);
      expect(toastr.info.calledWithExactly(`${message}-translated`, options)).to.equal(true);
      expect(toastr.success.callCount).to.equal(0);
      expect(toastr.warning.callCount).to.equal(0);
      expect(toastr.error.callCount).to.equal(0);
      expect(ladda.stopAll.callCount).to.equal(0);
    });

    it('type & message & invalid options', () => {
      // prepare

      // execute
      Notification.notify({ type: 'info', message, options: invalidOptions });

      // verify
      expect(toastr.info.callCount).to.equal(1);
      expect(toastr.info.calledWithExactly(`${message}-translated`, invalidOptions)).to.equal(true);
      expect(toastr.success.callCount).to.equal(0);
      expect(toastr.warning.callCount).to.equal(0);
      expect(toastr.error.callCount).to.equal(0);
      expect(ladda.stopAll.callCount).to.equal(0);
    });

    it('type & message & noTranslate', () => {
      // prepare

      // execute
      Notification.notify({ type: 'info', message, noTranslate: true });

      // verify
      expect(toastr.info.callCount).to.equal(1);
      expect(toastr.info.calledWithExactly(message, undefined)).to.equal(true);
      expect(toastr.success.callCount).to.equal(0);
      expect(toastr.warning.callCount).to.equal(0);
      expect(toastr.error.callCount).to.equal(0);
      expect(ladda.stopAll.callCount).to.equal(0);
    });
  });
});
