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
    sinon.spy(ladda, 'stopAll');
  });

  afterEach(() => {
    ladda.stopAll.restore();
  });

  describe('notify tests', () => {
    beforeEach(() => {
      sinon.spy(toastr, 'info');
      sinon.spy(toastr, 'success');
      sinon.spy(toastr, 'warning');
      sinon.spy(toastr, 'error');
    });

    afterEach(() => {
      toastr.info.restore();
      toastr.success.restore();
      toastr.warning.restore();
      toastr.error.restore();
    });

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

  describe('info & success & warning & error & errorNoTranslate tests', () => {
    beforeEach(() => {
      sinon.spy(Notification, 'notify');
    });

    afterEach(() => {
      Notification.notify.restore();
    });

    describe('info tests', () => {
      it('message filled', () => {
        // prepare

        // execute
        Notification.info(message);

        // verify
        expect(ladda.stopAll.callCount).to.equal(0);
        expect(Notification.notify.calledWithExactly({ type: 'info', message, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message empty', () => {
        // prepare

        // execute
        Notification.info();

        // verify
        expect(ladda.stopAll.callCount).to.equal(0);
        expect(Notification.notify.calledWithExactly({ type: 'info', message: undefined, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message & options filled', () => {
        // prepare

        // execute
        Notification.info(message, options);

        // verify
        expect(ladda.stopAll.callCount).to.equal(0);
        expect(Notification.notify.calledWithExactly({ type: 'info', message, options, translateOptions: undefined })).to.equal(true);
      });

      it('message & options & translateOptions filled', () => {
        // prepare

        // execute
        Notification.info(message, options, { asd: 213 });

        // verify
        expect(ladda.stopAll.callCount).to.equal(0);
        expect(Notification.notify.calledWithExactly({ type: 'info', message, options, translateOptions: { asd: 213 } })).to.equal(true);
      });
    });

    describe('success tests', () => {
      it('message filled', () => {
        // prepare

        // execute
        Notification.success(message);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'success', message, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message empty', () => {
        // prepare

        // execute
        Notification.success();

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'success', message: undefined, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message & options filled', () => {
        // prepare

        // execute
        Notification.success(message, options);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'success', message, options, translateOptions: undefined })).to.equal(true);
      });

      it('message & options & translateOptions filled', () => {
        // prepare

        // execute
        Notification.success(message, options, { asd: 213 });

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'success', message, options, translateOptions: { asd: 213 } })).to.equal(true);
      });
    });

    describe('warning tests', () => {
      it('message filled', () => {
        // prepare

        // execute
        Notification.warning(message);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'warning', message, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message empty', () => {
        // prepare

        // execute
        Notification.warning();

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'warning', message: undefined, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message & options filled', () => {
        // prepare

        // execute
        Notification.warning(message, options);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'warning', message, options, translateOptions: undefined })).to.equal(true);
      });

      it('message & options & translateOptions filled', () => {
        // prepare

        // execute
        Notification.warning(message, options, { asd: 213 });

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'warning', message, options, translateOptions: { asd: 213 } })).to.equal(true);
      });
    });

    describe('error tests', () => {
      it('message filled', () => {
        // prepare

        // execute
        Notification.error(message);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message empty', () => {
        // prepare

        // execute
        Notification.error();

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message: undefined, options: undefined, translateOptions: undefined })).to.equal(true);
      });

      it('message & options filled', () => {
        // prepare

        // execute
        Notification.error(message, options);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message, options, translateOptions: undefined })).to.equal(true);
      });

      it('message & options & translateOptions filled', () => {
        // prepare

        // execute
        Notification.error(message, options, { asd: 213 });

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message, options, translateOptions: { asd: 213 } })).to.equal(true);
      });
    });

    describe('errorNoTranslate tests', () => {
      it('message filled', () => {
        // prepare

        // execute
        Notification.errorNoTranslate(message);

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message, noTranslate: true })).to.equal(true);
      });

      it('message empty', () => {
        // prepare

        // execute
        Notification.errorNoTranslate();

        // verify
        expect(ladda.stopAll.callCount).to.equal(1);
        expect(Notification.notify.calledWithExactly({ type: 'error', message: undefined, noTranslate: true })).to.equal(true);
      });
    });
  });

  describe('start notification tests', () => {
    const buttonExists = 'existsButton';
    const buttonNotExists = 'notExistsButton';
    let laddaCreate;

    beforeEach(() => {
      laddaCreate = { start: sinon.stub() };
      sinon.stub(ladda.prototype, 'create').returns(laddaCreate);

      sinon.stub(document, 'querySelector').withArgs(sinon.match(buttonExists)).returns({ something: true }); // not important we're not testing query selector or ladda
      sinon.stub(document, 'querySelector').withArgs(sinon.match(buttonNotExists)).returns(undefined);
    });

    afterEach(() => {
      ladda.prototype.create.restore();
      document.querySelector.restore();
    });

    it('button exists', () => {
      // prepare

      // execute
      Notification.start(buttonExists);

      // verify
      expect(document.querySelector.callCount).to.equal(1);
      expect(document.querySelector.calledWithExactly(buttonExists)).to.equal(true);
      expect(laddaCreate.start.calledAfter(ladda.prototype.create)).to.equal(true);
      expect(ladda.create.callCount).to.equal(1);
      expect(ladda.create.calledWithExactly({ something: true })).to.equal(true);
    });
  });
});
