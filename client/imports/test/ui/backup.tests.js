/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { Backup } from '/client/imports/ui';
import { ErrorHandler, Notification, UIComponents } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';

describe('ReactivityProvider', () => {
  describe('loadDatabases tests', () => {
    const notExistPrefix = 'notExist';
    const existPrefix = 'exist';

    const assertErrorYield = function () {
      expect(Notification.start.callCount).to.equal(4);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'getDatabases' })).to.equal(true);
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: $(`#${existPrefix}--db`) })).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
    };

    beforeEach(() => {
      const existCombo = document.createElement('select');
      existCombo.setAttribute('id', `${existPrefix}--db`);

      document.body.append(existCombo);

      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(UIComponents.Combobox, 'init');
    });

    afterEach(() => {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }

      Notification.start.restore();
      Notification.stop.restore();
      ErrorHandler.showMeteorFuncError.restore();
      UIComponents.Combobox.init.restore();
    });

    it('loadDatabases invalid prefix', () => {
      // prepare
      // execute
      // verify
      expect(() => { Backup.loadDatabases(notExistPrefix); }).to.throw(notExistPrefix);
    });

    it('loadDatabases valid prefix & communicator yields error', () => {
      // prepare
      const error = { error: 'invalid call' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);

      // execute
      Backup.loadDatabases(existPrefix);

      // verify
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error, undefined)).to.equal(true);
      assertErrorYield();

      // cleanup
      Communicator.call.restore();
    });

    it('loadDatabases valid prefix & communicator yields error (1)', () => {
      // prepare
      const error = { error: 'invalid call' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);

      // execute
      Backup.loadDatabases(existPrefix);

      // verify
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(null, error)).to.equal(true);
      assertErrorYield();

      // cleanup
      Communicator.call.restore();
    });
  });
});
