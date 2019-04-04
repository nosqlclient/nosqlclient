/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { Backup } from '/client/imports/ui';
import { ErrorHandler, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
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

  describe('initializeUI tests', () => {
    const dataStub = { setOption: sinon.stub() };

    beforeEach(() => {
      sinon.stub(UIComponents.Combobox, 'init');
      sinon.stub(UIComponents.Combobox, 'setOptionsComboboxChangeEvent');
      sinon.stub(UIComponents.Editor, 'initializeCodeMirror');
      sinon.stub(SessionManager, 'set');
      sinon.stub($.prototype, 'data').returns(dataStub);
    });

    afterEach(() => {
      UIComponents.Combobox.init.restore();
      UIComponents.Combobox.setOptionsComboboxChangeEvent.restore();
      UIComponents.Editor.initializeCodeMirror.restore();
      SessionManager.set.restore();
      $.prototype.data.restore();
    });

    it('initializeUI', () => {
      // prepare
      const selector1 = $('#cmbMongodumpArgs');
      const selector2 = $('#cmbMongorestoreArgs');
      const selector3 = $('#cmbMongoexportArgs');
      const selector4 = $('#cmbMongoimportArgs');

      const divSelector1 = $('#mongodump');
      const divSelector2 = $('#mongorestore');
      const divSelector3 = $('#mongoexport');
      const divSelector4 = $('#mongoimport');

      // execute
      Backup.initializeUI();

      // verify
      expect(UIComponents.Combobox.init.callCount).to.equal(4);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: selector1, empty: false, options: {} })).to.equal(true);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: selector2, empty: false, options: {} })).to.equal(true);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: selector3, empty: false, options: {} })).to.equal(true);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: selector4, empty: false, options: {} })).to.equal(true);

      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.callCount).to.equal(4);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector1, SessionManager.strSessionMongodumpArgs)).to.equal(true);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector2, SessionManager.strSessionMongorestoreArgs)).to.equal(true);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector3, SessionManager.strSessionMongoexportArgs)).to.equal(true);
      expect(UIComponents.Combobox.setOptionsComboboxChangeEvent.calledWithExactly(selector4, SessionManager.strSessionMongoimportArgs)).to.equal(true);

      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(4);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: divSelector1, txtAreaId: 'txtMongodumpLogs', height: 150, noResize: true })).to.equal(true);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: divSelector2, txtAreaId: 'txtMongorestoreLogs', height: 150, noResize: true })).to.equal(true);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: divSelector3, txtAreaId: 'txtMongoexportLogs', height: 150, noResize: true })).to.equal(true);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: divSelector4, txtAreaId: 'txtMongoimportLogs', height: 150, noResize: true })).to.equal(true);

      expect(SessionManager.set.callCount).to.equal(4);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionMongodumpArgs, ['--host', '--out'])).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionMongorestoreArgs, ['--host', '--dir'])).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionMongoexportArgs, ['--host', '--out'])).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionMongoimportArgs, ['--host', '--file'])).to.equal(true);

      expect(dataStub.setOption.callCount).to.equal(4);
      expect(dataStub.setOption.alwaysCalledWithExactly('readOnly', true)).to.equal(true);
    });
  });

  describe('removeDumpLogs tests', () => {
    beforeEach(() => {
      sinon.stub(Communicator, 'call');
    });

    afterEach(() => {
      Communicator.call.restore();
    });

    it('removeDumpLogs', () => {
      // prepare

      // execute
      Backup.removeDumpLogs();

      // verify
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'removeDumpLogs' })).to.equal(true);
    });
  });

  describe('init tests', () => {
    let clock;
    let valStub;
    let dataStub;
    const previousValue = 'testing';
    const testingId = 'testingID';
    const findOneResponse = { servers: [{ host: 'server1', port: 222 }, { host: 'server2', port: 555 }] };

    beforeEach(() => {
      valStub = { trigger: sinon.stub() };
      dataStub = { focus: sinon.stub(), setCursor: sinon.stub(), lineCount: sinon.stub().returns(5), getLine: sinon.stub().returns({ length: 3 }) };
      clock = sinon.useFakeTimers();
      sinon.stub(ReactivityProvider, 'findOne').returns(findOneResponse);
      sinon.stub(Notification, 'stop');
      sinon.stub($.prototype, 'val').returns(valStub);
      sinon.stub($.prototype, 'data').returns(dataStub);
      sinon.stub(UIComponents.Editor, 'getCodeMirrorValue').returns(previousValue);
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
      sinon.stub(SessionManager, 'get').returns({ _id: testingId });
    });

    afterEach(() => {
      clock.restore();
      ReactivityProvider.findOne.restore();
      Notification.stop.restore();
      $.prototype.val.restore();
      $.prototype.data.restore();
      UIComponents.Editor.getCodeMirrorValue.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
      SessionManager.get.restore();
    });

    it('init without clock tick & with sessionId & observeChanges yieldsto CLOSED', () => {
      // prepare
      const sessionId = Meteor.default_connection._lastSessionId;
      sinon.stub(ReactivityProvider, 'observeChanges').yieldsTo('added', null, { message: 'CLOSED' });

      // execute
      Backup.init(sessionId);

      // verify
      expect($.prototype.val.callCount).to.equal(4);
      expect(valStub.trigger.callCount).to.equal(4);
      expect(ReactivityProvider.findOne.callCount).to.equal(0);
      expect(ReactivityProvider.observeChanges.callCount).to.equal(1);
      expect(ReactivityProvider.observeChanges.calledWith(ReactivityProvider.types.Dumps, { sessionId }, { sort: { date: -1 } }, { added: sinon.match.func })).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
      expect(dataStub.focus.callCount).to.equal(0);
      expect(dataStub.setCursor.callCount).to.equal(0);

      // cleanup
      ReactivityProvider.observeChanges.restore();
    });

    it('init without clock tick & with sessionId & observeChanges yieldsto still working', () => {
      // prepare
      const div = $('#mongodump');
      const message = 'dumping, please wait';
      const sessionId = Meteor.default_connection._lastSessionId;
      sinon.stub(ReactivityProvider, 'observeChanges').yieldsTo('added', null, { message, binary: 'mongodump' });

      // execute
      Backup.init(sessionId);

      // verify
      expect($.prototype.val.callCount).to.equal(4);
      expect(valStub.trigger.callCount).to.equal(4);
      expect(ReactivityProvider.findOne.callCount).to.equal(0);
      expect(ReactivityProvider.observeChanges.callCount).to.equal(1);
      expect(ReactivityProvider.observeChanges.calledWith(ReactivityProvider.types.Dumps, { sessionId }, { sort: { date: -1 } }, { added: sinon.match.func })).to.equal(true);
      expect(Notification.stop.callCount).to.equal(0);
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#mongodump');
      expect($.prototype.data.calledWithExactly('editor')).to.equal(true);

      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.getCodeMirrorValue.calledWithExactly(div));

      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly(div, previousValue + message)).to.equal(true);

      expect(dataStub.focus.callCount).to.equal(1);
      expect(dataStub.setCursor.callCount).to.equal(1);
      expect(dataStub.setCursor.calledWithExactly(3, 1)).to.equal(true);

      // cleanup
      ReactivityProvider.observeChanges.restore();
    });

    it('init with clock tick & with sessionId & observeChanges yieldsto CLOSED', () => {
      // prepare
      const sessionId = Meteor.default_connection._lastSessionId;
      sinon.stub(ReactivityProvider, 'observeChanges').yieldsTo('added', null, { message: 'CLOSED' });

      // execute
      Backup.init(sessionId);

      // verify
      expect($.prototype.val.callCount).to.equal(4);
      expect(valStub.trigger.callCount).to.equal(4);
      expect(ReactivityProvider.findOne.callCount).to.equal(0);
      expect(ReactivityProvider.observeChanges.callCount).to.equal(1);
      expect(ReactivityProvider.observeChanges.calledWith(ReactivityProvider.types.Dumps, { sessionId }, { sort: { date: -1 } }, { added: sinon.match.func })).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
      expect(dataStub.focus.callCount).to.equal(0);
      expect(dataStub.setCursor.callCount).to.equal(0);

      clock.tick(100);

      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Connections, { _id: testingId })).to.equal(true);
      expect($.prototype.val.callCount).to.equal(8);
      expect($.prototype.val.calledWith(
        `${findOneResponse.servers[0].host}:${findOneResponse.servers[0].port},${findOneResponse.servers[1].host}:${findOneResponse.servers[1].port}`))
        .to.equal(true);

      // cleanup
      ReactivityProvider.observeChanges.restore();
    });
  });
});
