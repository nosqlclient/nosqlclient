/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { SessionManager, UIComponents, Notification, ErrorHandler, ExtendedJSON } from '/client/imports/modules';
import { CollectionValidationRules } from '/client/imports/ui/collection';
import { ReactivityProvider, Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import CollectionHelper from '/client/imports/ui/collection/helper';

describe('CollectionValidationRules', () => {
  describe('resetForm tests', () => {
    const collectionName = 'collectionNAME';
    const translated = 'teetetetetete';

    beforeEach(() => {
      sinon.stub(UIComponents.Editor, 'initializeCodeMirror');
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
      sinon.stub($.prototype, 'html');
      sinon.stub($.prototype, 'data').withArgs('collection').returns(collectionName);
      sinon.stub(Helper, 'translate').withArgs({ key: 'mongodb_version_warning', options: { version: '3.2' } }).returns(translated);
      sinon.stub(UIComponents.Combobox, 'init');
      sinon.stub(UIComponents.Combobox, 'deselectAll');
      sinon.stub(CollectionValidationRules, 'initRules');
    });

    afterEach(() => {
      UIComponents.Editor.initializeCodeMirror.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
      $.prototype.html.restore();
      $.prototype.data.restore();
      Helper.translate.restore();
      UIComponents.Combobox.init.restore();
      UIComponents.Combobox.deselectAll.restore();
      CollectionValidationRules.initRules.restore();
    });

    it('resetForm', () => {
      // prepare

      // execute
      CollectionValidationRules.resetForm();

      // verify
      const divValidator = $('#divValidator');
      const comboBoxes = $('#cmbValidationAction, #cmbValidationLevel');

      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(1);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: divValidator, txtAreaId: 'txtValidator' })).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly(divValidator, '', $('#txtValidator'))).to.equal(true);
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(`${translated}<br/>${collectionName}`)).to.equal(true);
      expect(UIComponents.Combobox.init.callCount).to.equal(1);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: comboBoxes, options: {}, empty: false })).to.equal(true);
      expect(UIComponents.Combobox.deselectAll.callCount).to.equal(1);
      expect(UIComponents.Combobox.deselectAll.calledWithExactly(comboBoxes)).to.equal(true);
      expect(CollectionValidationRules.initRules.callCount).to.equal(1);
      expect(CollectionValidationRules.initRules.calledWithExactly()).to.equal(true);
    });
  });

  describe('initRules tests', () => {
    const connectionId = '123';
    let valStub;

    const assertNoExecution = function (settingsCall) {
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#validationRulesModal');
      expect(ReactivityProvider.findOne.callCount).to.equal(settingsCall ? 1 : 0);
      if (settingsCall) expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Connections, { _id: connectionId })).to.equal(true);
      expect(Notification.start.callCount).to.equal(0);
      expect(Notification.stop.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    };

    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'stop');
      sinon.stub($.prototype, 'val').returns(valStub);
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionConnection).returns({ _id: connectionId });
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
    });

    afterEach(() => {
      ReactivityProvider.findOne.restore();
      Communicator.call.restore();
      Notification.start.restore();
      Notification.stop.restore();
      ErrorHandler.showMeteorFuncError.restore();
      $.prototype.data.restore();
      $.prototype.val.restore();
      SessionManager.get.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
    });

    it('initRules no collection', () => {
      // prepare
      const databaseName = 'sercanDB';
      sinon.stub($.prototype, 'data');
      sinon.stub(ReactivityProvider, 'findOne').withArgs(ReactivityProvider.types.Connections, { _id: connectionId }).returns({ databaseName });
      sinon.stub(Communicator, 'call');

      // execute
      CollectionValidationRules.initRules();

      // verify
      assertNoExecution();
    });

    it('initRules no connection', () => {
      // prepare
      const collection = 'sercanCol';
      sinon.stub($.prototype, 'data').returns(collection);
      sinon.stub(ReactivityProvider, 'findOne');
      sinon.stub(Communicator, 'call');

      // execute
      CollectionValidationRules.initRules();

      // verify
      assertNoExecution(true);
    });

    it('initRules valid connection and collection & communicator yields to error', () => {
      // prepare
      const collection = 'sercanCol';
      const databaseName = 'sercanDB';
      const error = { error: '1233' };
      sinon.stub($.prototype, 'data').returns(collection);
      sinon.stub(ReactivityProvider, 'findOne').withArgs(ReactivityProvider.types.Connections, { _id: connectionId }).returns({ databaseName });
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);

      // execute
      CollectionValidationRules.initRules();

      // verify
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#validationRulesModal');
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Connections, { _id: connectionId })).to.equal(true);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveValidationRules')).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'listCollectionNames', args: { dbName: databaseName }, callback: sinon.match.func })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('initRules valid connection and collection & communicator yields to success', () => {
      // prepare
      const collection = 'sercanCol';
      const databaseName = 'sercanDB';
      const result = { result: [{ name: collection, options: { validationAction: '123', validationLevel: true, validator: { abc: true } } }, { name: 'tugce' }] };
      sinon.stub($.prototype, 'data').returns(collection);
      sinon.stub(ReactivityProvider, 'findOne').withArgs(ReactivityProvider.types.Connections, { _id: connectionId }).returns({ databaseName });
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, result);

      // execute
      CollectionValidationRules.initRules();

      // verify
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#validationRulesModal');
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Connections, { _id: connectionId })).to.equal(true);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveValidationRules')).to.equal(true);
      expect(Notification.stop.callCount).to.equal(1);
      expect(Notification.stop.calledWithExactly()).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'listCollectionNames', args: { dbName: databaseName }, callback: sinon.match.func })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.calledWithExactly(result.result[0].options.validationAction)).to.equal(true);
      expect($.prototype.val.calledWithExactly(result.result[0].options.validationLevel)).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(2);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divValidator'), JSON.stringify(result.result[0].options.validator, null, 1))).to.equal(true);
    });
  });

  describe('save tests', () => {
    const collectionName = 'sercanCOLLECTION';
    const codeMirrorValue = '123123123';
    const val = 'something';

    beforeEach(() => {
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'error');
      sinon.stub($.prototype, 'val').returns(val);
      sinon.stub($.prototype, 'data').returns(collectionName);
      sinon.stub(UIComponents.Editor, 'getCodeMirrorValue').withArgs($('#divValidator')).returns(codeMirrorValue);
      sinon.stub(CollectionHelper, 'executeCommand');
    });

    afterEach(() => {
      Notification.start.restore();
      Notification.error.restore();
      $.prototype.val.restore();
      $.prototype.data.restore();
      UIComponents.Editor.getCodeMirrorValue.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      CollectionHelper.executeCommand.restore();
    });

    it('save not valid validator', () => {
      // prepare
      const validatorJson = { ERROR: 'some_error' };
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(codeMirrorValue).returns(validatorJson);

      // execute
      CollectionValidationRules.save();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveValidationRules')).to.equal(true);
      expect($.prototype.val.callCount).to.equal(0);
      expect($.prototype.data.callCount).to.equal(0);
      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.getCodeMirrorValue.calledWithExactly($('#divValidator'))).to.equal(true);
      expect(ExtendedJSON.convertAndCheckJSON.callCount).to.equal(1);
      expect(ExtendedJSON.convertAndCheckJSON.calledWithExactly(codeMirrorValue)).to.equal(true);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-validator', null, { error: validatorJson.ERROR })).to.equal(true);
      expect(CollectionHelper.executeCommand.callCount).to.equal(0);
    });

    it('save not valid validator', () => {
      // prepare
      const validatorJson = { something: '123' };
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(codeMirrorValue).returns(validatorJson);

      // execute
      CollectionValidationRules.save();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnSaveValidationRules')).to.equal(true);
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.alwaysCalledWithExactly()).to.equal(true);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#cmbValidationAction'); // find a better check...
      expect($.prototype.val.getCall(1).thisValue.selector).to.equal('#cmbValidationLevel');
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.data.getCall(0).thisValue.selector).to.equal('#validationRulesModal');
      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.getCodeMirrorValue.calledWithExactly($('#divValidator'))).to.equal(true);
      expect(ExtendedJSON.convertAndCheckJSON.callCount).to.equal(1);
      expect(ExtendedJSON.convertAndCheckJSON.calledWithExactly(codeMirrorValue)).to.equal(true);
      expect(Notification.error.callCount).to.equal(0);
      expect(CollectionHelper.executeCommand.callCount).to.equal(1);
      expect(CollectionHelper.executeCommand.calledWithExactly({
        collMod: collectionName,
        validator: validatorJson,
        validationLevel: val,
        validationAction: val
      }, 'validationRulesModal')).to.equal(true);
    });
  });
});
