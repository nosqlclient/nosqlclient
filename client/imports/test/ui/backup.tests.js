/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { Backup } from '/client/imports/ui';
import { ErrorHandler, Notification, UIComponents } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '../../helpers/helper';

describe('Backup', () => {
  describe('database & collection combo load tests', () => {
    const notExistPrefix = 'notExist';
    const existPrefix = 'exist';
    const selectedDb = 'myDB';
    const callbackResult = { result: 'ttt' };

    const assertCall = function (communicatorArgs, success = false, isSelectorCollection = false) {
      const prefix = isSelectorCollection ? `#${existPrefix}--collection` : `#${existPrefix}--db`;

      expect(Notification.start.callCount).to.equal(4);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch(communicatorArgs)).to.equal(true);
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: $(prefix) })).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      if (success) {
        expect(Helper.populateComboboxData.callCount).to.equal(1);
        expect(Helper.populateComboboxData.calledWithMatch(callbackResult.result, 'name')).to.equal(true);
      }
    };

    beforeEach(() => {
      const existCombo = document.createElement('select');
      existCombo.setAttribute('id', `${existPrefix}--db`);

      const existCombo2 = document.createElement('select');
      existCombo2.setAttribute('id', `${existPrefix}--collection`);

      document.body.append(existCombo);
      document.body.append(existCombo2);

      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(UIComponents.Combobox, 'init');
      sinon.stub(Helper, 'populateComboboxData');
    });

    afterEach(() => {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }

      Notification.start.restore();
      Notification.stop.restore();
      ErrorHandler.showMeteorFuncError.restore();
      UIComponents.Combobox.init.restore();
      Helper.populateComboboxData.restore();
    });

    describe('loadDatabases tests', () => {
      it('loadDatabases invalid prefix', () => {
        // prepare
        sinon.spy(Communicator, 'call');

        // execute
        Backup.loadDatabases(notExistPrefix);

        // verify
        expect(Notification.start.callCount).to.equal(0);
        expect(Notification.stop.callCount).to.equal(0);
        expect(Communicator.call.callCount).to.equal(0);
        expect(UIComponents.Combobox.init.callCount).to.equal(0);
        expect(Helper.populateComboboxData.callCount).to.equal(0);

        // cleanup
        Communicator.call.restore();
      });

      it('loadDatabases valid prefix & communicator yields error', () => {
        // prepare
        const error = { error: 'invalid call' };
        sinon.stub(Communicator, 'call').yieldsTo('callback', error);

        // execute
        Backup.loadDatabases(existPrefix);

        // verify
        expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error, undefined)).to.equal(true);
        assertCall({ methodName: 'getDatabases' });

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
        assertCall({ methodName: 'getDatabases' });

        // cleanup
        Communicator.call.restore();
      });

      it('loadDatabases valid prefix & communicator yields success', () => {
        // prepare
        sinon.stub(Communicator, 'call').yieldsTo('callback', null, callbackResult);

        // execute
        Backup.loadDatabases(existPrefix);

        // verify
        assertCall({ methodName: 'getDatabases' }, true);

        // cleanup
        Communicator.call.restore();
      });
    });

    describe('loadCollectionsCombo tests', () => {
      it('loadCollectionsCombo invalid prefix', () => {
        // prepare
        sinon.spy(Communicator, 'call');

        // execute
        Backup.loadCollectionsCombo(notExistPrefix);

        // verify
        expect(Notification.start.callCount).to.equal(0);
        expect(Notification.stop.callCount).to.equal(0);
        expect(Communicator.call.callCount).to.equal(0);
        expect(UIComponents.Combobox.init.callCount).to.equal(0);
        expect(Helper.populateComboboxData.callCount).to.equal(0);

        // cleanup
        Communicator.call.restore();
      });

      it('loadCollectionsCombo valid prefix & communicator yields error', () => {
        // prepare
        const error = { error: 'invalid call' };
        sinon.stub(Communicator, 'call').yieldsTo('callback', error);
        sinon.stub($.prototype, 'val').returns(selectedDb);

        // execute
        Backup.loadCollectionsCombo(existPrefix);

        // verify
        expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error, undefined)).to.equal(true);
        assertCall({ methodName: 'listCollectionNames', args: { dbName: selectedDb } }, false, true);

        // cleanup
        Communicator.call.restore();
        $.prototype.val.restore();
      });

      it('loadCollectionsCombo valid prefix & communicator yields error (1)', () => {
        // prepare
        const error = { error: 'invalid call' };
        sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
        sinon.stub($.prototype, 'val').returns(selectedDb);

        // execute
        Backup.loadCollectionsCombo(existPrefix);

        // verify
        expect(ErrorHandler.showMeteorFuncError.calledWithMatch(null, error)).to.equal(true);
        assertCall({ methodName: 'listCollectionNames', args: { dbName: selectedDb } }, false, true);

        // cleanup
        Communicator.call.restore();
        $.prototype.val.restore();
      });

      it('loadCollectionsCombo valid prefix & no selected db', () => {
        // prepare
        sinon.spy(Communicator, 'call');
        sinon.stub($.prototype, 'val').returns('');

        // execute
        Backup.loadCollectionsCombo(existPrefix);

        // verify
        expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
        expect(Notification.start.callCount).to.equal(4);
        expect(Communicator.call.callCount).to.equal(0);
        expect(UIComponents.Combobox.init.callCount).to.equal(1);
        expect(UIComponents.Combobox.init.calledWithMatch({ selector: $(`#${existPrefix}--collection`) })).to.equal(true);
        expect(Notification.stop.callCount).to.equal(1);

        // cleanup
        Communicator.call.restore();
        $.prototype.val.restore();
      });


      it('loadCollectionsCombo valid prefix & communicator yields success', () => {
        // prepare
        sinon.stub($.prototype, 'val').returns(selectedDb);
        sinon.stub(Communicator, 'call').yieldsTo('callback', null, callbackResult);

        // execute
        Backup.loadCollectionsCombo(existPrefix);

        // verify
        assertCall({ methodName: 'listCollectionNames', args: { dbName: selectedDb } }, true, true);

        // cleanup
        Communicator.call.restore();
        $.prototype.val.restore();
      });
    });
  });

  describe('clearLogs tests', () => {
    beforeEach(() => {
      sinon.stub(Communicator, 'call');
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
    });

    afterEach(() => {
      Communicator.call.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
    });

    it('clearLogs invalid param', () => {
      // prepare
      // execute
      Backup.clearLogs('invalid');

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('clearLogs invalid param (1)', () => {
      // prepare
      // execute
      Backup.clearLogs();

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('clearLogs valid param', () => {
      // prepare
      const binary = 'mongodump';

      // execute
      Backup.clearLogs(binary);

      // verify
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'removeDumpLogs', args: { binary } })).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($(`#${binary}`), '')).to.equal(true);
    });


    it('clearLogs valid param (1)', () => {
      // prepare
      const binary = 'mongorestore';

      // execute
      Backup.clearLogs(binary);

      // verify
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'removeDumpLogs', args: { binary } })).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($(`#${binary}`), '')).to.equal(true);
    });
  });

  describe('callBinaryMethod tests', () => {
    const args = { myTest: 123, name: 'sercan' };

    beforeEach(() => {
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
    });

    afterEach(() => {
      Notification.start.restore();
      Notification.stop.restore();
      ErrorHandler.showMeteorFuncError.restore();
    });

    it('callBinaryMethod invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');

      // execute
      Backup.callBinaryMethod('#someButton');

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Communicator.call.restore();
    });

    it('callBinaryMethod invalid param (1)', () => {
      // prepare
      sinon.spy(Communicator, 'call');

      // execute
      Backup.callBinaryMethod('', 'mongodump', () => {});

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Communicator.call.restore();
    });

    it('callBinaryMethod invalid param (2)', () => {
      // prepare
      sinon.spy(Communicator, 'call');

      // execute
      Backup.callBinaryMethod('#testButton', 'invalid', () => {});

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Communicator.call.restore();
    });

    it('callBinaryMethod invalid param (3)', () => {
      // prepare
      sinon.spy(Communicator, 'call');

      // execute
      Backup.callBinaryMethod('#testButton', 'mongoexport', 'invalid');

      // verify
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Communicator.call.restore();
    });

    it('callBinaryMethod valid param', () => {
      // prepare
      const binary = 'mongodump';
      sinon.stub(Backup, 'getMongodumpArgs').returns(args);
      sinon.stub(Communicator, 'call').yieldsTo('callback');

      // execute
      Backup.callBinaryMethod('#testButton', binary, Backup.getMongodumpArgs);

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#testButton')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: binary, args: { args }, callback: sinon.match.func })).to.equal(true);
      expect(Backup.getMongodumpArgs.callCount).to.equal(1);
      expect(Backup.getMongodumpArgs.calledWithExactly()).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Backup.getMongodumpArgs.restore();
      Communicator.call.restore();
    });

    it('callBinaryMethod valid param & communicator yields error', () => {
      // prepare
      const binary = 'mongodump';
      const error = { error: 'test' };
      sinon.stub(Backup, 'getMongodumpArgs').returns(args);
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);

      // execute
      Backup.callBinaryMethod('#testButton', binary, Backup.getMongodumpArgs);

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#testButton')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: binary, args: { args }, callback: sinon.match.func })).to.equal(true);
      expect(Backup.getMongodumpArgs.callCount).to.equal(1);
      expect(Backup.getMongodumpArgs.calledWithExactly()).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);

      // cleanup
      Backup.getMongodumpArgs.restore();
      Communicator.call.restore();
    });

    it('callBinaryMethod valid param & argsMethod returns null', () => {
      // prepare
      const binary = 'mongodump';
      sinon.stub(Backup, 'getMongodumpArgs').returns(null);
      sinon.spy(Communicator, 'call');

      // execute
      Backup.callBinaryMethod('#testButton', binary, Backup.getMongodumpArgs);

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#testButton')).to.equal(true);
      expect(Backup.getMongodumpArgs.callCount).to.equal(1);
      expect(Backup.getMongodumpArgs.calledWithExactly()).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);

      // cleanup
      Backup.getMongodumpArgs.restore();
      Communicator.call.restore();
    });
  });
});
