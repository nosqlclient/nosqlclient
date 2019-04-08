/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionAdd, Connection } from '/client/imports/ui';
import { Enums, ErrorHandler, ExtendedJSON, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';
import { Communicator, ReactivityProvider } from '/client/imports/facades';

// FIXME selector check when stubbing whole object for jquery
describe('CollectionAdd', () => {
  describe('init tests', () => {
    const assertDefaultExecution = function (validatorTab) {
      const callCount = validatorTab ? 2 : 1;
      expect(UIComponents.Combobox.init.callCount).to.equal(callCount);
      expect(UIComponents.Combobox.init.calledWithMatch({ selector: $('#cmbCollectionOrView'), options: {}, empty: false })).to.equal(true);
      if (validatorTab) {
        expect(UIComponents.Combobox.init.calledWithMatch({
          empty: false, selector: $('#cmbValidationActionAddCollection, #cmbValidationLevelAddCollection'), options: { allow_single_deselect: true } })).to.equal(true);
      }
      expect(UIComponents.Combobox.initializeOptionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeOptionsCombobox.calledWith(
        $('#cmbAddCollectionViewOptions'), Enums.ADD_COLLECTION_OPTIONS, SessionManager.strSessionSelectedAddCollectionOptions)).to.equal(true);
    };

    beforeEach(() => {
      sinon.stub(UIComponents.Combobox, 'init');
      sinon.stub(UIComponents.Combobox, 'initializeOptionsCombobox');
      sinon.stub(UIComponents.Editor, 'initializeCodeMirror');
    });

    afterEach(() => {
      UIComponents.Combobox.init.restore();
      UIComponents.Combobox.initializeOptionsCombobox.restore();
      UIComponents.Editor.initializeCodeMirror.restore();
    });

    it('init without yield', () => {
      // prepare
      sinon.stub($.prototype, 'on');

      // execute
      CollectionAdd.init();

      // verify
      assertDefaultExecution();
      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(0);

      // clean up
      $.prototype.on.restore();
    });

    it('init with yield & tab-2-engine', () => {
      // prepare
      const target = '#tab-2-engine';
      sinon.stub($.prototype, 'on').yields({ target });
      sinon.stub($.prototype, 'attr').returns(target);

      // execute
      CollectionAdd.init();

      // verify
      assertDefaultExecution();
      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(1);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: $('#divStorageEngine'), txtAreaId: 'txtStorageEngine' })).to.equal(true);

      // clean up
      $.prototype.on.restore();
      $.prototype.attr.restore();
    });

    it('init with yield & tab-3-validator', () => {
      // prepare
      const target = '#tab-3-validator';
      sinon.stub($.prototype, 'on').yields({ target });
      sinon.stub($.prototype, 'attr').returns(target);

      // execute
      CollectionAdd.init();

      // verify
      assertDefaultExecution(true);
      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(1);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: $('#divValidatorAddCollection'), txtAreaId: 'txtValidatorAddCollection' })).to.equal(true);

      // clean up
      $.prototype.on.restore();
      $.prototype.attr.restore();
    });

    it('init with yield & tab-4-collation', () => {
      // prepare
      const target = '#tab-4-collation';
      sinon.stub($.prototype, 'on').yields({ target });
      sinon.stub($.prototype, 'attr').returns(target);

      // execute
      CollectionAdd.init();

      // verify
      assertDefaultExecution();
      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(1);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: $('#divCollationAddCollection'), txtAreaId: 'txtCollationAddCollection' })).to.equal(true);

      // clean up
      $.prototype.on.restore();
      $.prototype.attr.restore();
    });
  });

  describe('getFlagValue tests', () => {
    it('getFlagValue', () => {
      // prepare
      sinon.stub(UIComponents.Checkbox, 'getState').withArgs($('#inputTwoSizesIndexes')).returns(false).withArgs($('#inputNoPadding'))
        .returns(true);

      // execute
      const result = CollectionAdd.getFlagValue();

      // verify
      expect(result).to.equal(2);

      // cleanup
      UIComponents.Checkbox.getState.restore();
    });

    it('getFlagValue (1)', () => {
      // prepare
      sinon.stub(UIComponents.Checkbox, 'getState').withArgs($('#inputTwoSizesIndexes')).returns(true).withArgs($('#inputNoPadding'))
        .returns(true);

      // execute
      const result = CollectionAdd.getFlagValue();

      // verify
      expect(result).to.equal(3);

      // cleanup
      UIComponents.Checkbox.getState.restore();
    });

    it('getFlagValue (2)', () => {
      // prepare
      sinon.stub(UIComponents.Checkbox, 'getState').withArgs($('#inputTwoSizesIndexes')).returns(true).withArgs($('#inputNoPadding'))
        .returns(false);

      // execute
      const result = CollectionAdd.getFlagValue();

      // verify
      expect(result).to.equal(1);

      // cleanup
      UIComponents.Checkbox.getState.restore();
    });

    it('getFlagValue (3)', () => {
      // prepare
      sinon.stub(UIComponents.Checkbox, 'getState').withArgs($('#inputTwoSizesIndexes')).returns(false).withArgs($('#inputNoPadding'))
        .returns(false);

      // execute
      const result = CollectionAdd.getFlagValue();

      // verify
      expect(result).to.equal(0);

      // cleanup
      UIComponents.Checkbox.getState.restore();
    });
  });

  describe('getOptions tests', () => {
    it('getOptions with no options', () => {
      // prepare
      sinon.stub(SessionManager, 'get').returns([]);

      // execute
      const options = CollectionAdd.getOptions();

      // verify
      expect(options).to.eql({});

      // clean up
      SessionManager.get.restore();
    });

    it('getOptions with options', () => {
      // prepare
      sinon.stub(SessionManager, 'get').returns(['CAPPED']);
      sinon.stub($.prototype, 'val').returns('5');

      // execute
      const options = CollectionAdd.getOptions();

      // verify
      expect(options).to.eql({ max: 5, size: 5, capped: true });

      // clean up
      SessionManager.get.restore();
      $.prototype.val.restore();
    });

    it('getOptions with options (1)', () => {
      // prepare
      sinon.stub(SessionManager, 'get').returns(['CAPPED', 'FLAGS']);
      sinon.stub($.prototype, 'val').returns('5');
      sinon.stub(CollectionAdd, 'getFlagValue').returns(-1);

      // execute
      const options = CollectionAdd.getOptions();

      // verify
      expect(options).to.eql({ max: 5, size: 5, capped: true, flags: -1 });

      // clean up
      SessionManager.get.restore();
      $.prototype.val.restore();
      CollectionAdd.getFlagValue.restore();
    });

    it('getOptions with options (2)', () => {
      // prepare
      sinon.stub(SessionManager, 'get').returns(['CAPPED', 'FLAGS', 'INDEX_OPTION_DEFAULTS']);
      sinon.stub($.prototype, 'val').returns('5');
      sinon.stub(CollectionAdd, 'getFlagValue').returns(-1);
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').returns({ test: 'sercan' });
      sinon.stub(UIComponents.Editor, 'getCodeMirrorValue').returns('NOT_IMPORTANT');

      // execute
      const options = CollectionAdd.getOptions();

      // verify
      expect(options).to.eql({ max: 5, size: 5, capped: true, flags: -1, indexOptionDefaults: { test: 'sercan' } });

      // clean up
      SessionManager.get.restore();
      $.prototype.val.restore();
      CollectionAdd.getFlagValue.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      UIComponents.Editor.getCodeMirrorValue.restore();
    });

    it('getOptions with options (3)', () => {
      // prepare
      const error = 'errorTEST';

      sinon.stub(SessionManager, 'get').returns(['FLAGS', 'INDEX_OPTION_DEFAULTS']);
      sinon.stub(CollectionAdd, 'getFlagValue').returns(-1);
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').returns({ ERROR: error, test: 'sercan' });
      sinon.stub(UIComponents.Editor, 'getCodeMirrorValue').returns('NOT_IMPORTANT');
      sinon.stub(Helper, 'translate').returns(`${error}translated`);

      // execute
      const options = CollectionAdd.getOptions();

      // verify
      expect(options).to.eql({ flags: -1, ERROR: `${error}translated` });
      expect(Helper.translate.callCount).to.equal(1);
      expect(Helper.translate.calledWithMatch(({ key: 'syntax-error-index-option-defaults', options: { error } })));

      // clean up
      SessionManager.get.restore();
      CollectionAdd.getFlagValue.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      UIComponents.Editor.getCodeMirrorValue.restore();
      Helper.translate.restore();
    });
  });

  describe('gatherOptions tests', () => {
    const collationVal = 'collation';
    const pipelineVal = 'pipeline';
    const storageEngineVal = 'storageEngine';
    const validatorVal = 'validator';

    beforeEach(() => {
      sinon.stub(UIComponents.Editor, 'getCodeMirrorValue').withArgs($('#divCollationAddCollection')).returns(collationVal).withArgs($('#divViewPipeline'))
        .returns(pipelineVal)
        .withArgs($('#divStorageEngine'))
        .returns(storageEngineVal)
        .withArgs($('#divValidatorAddCollection'))
        .returns(validatorVal);
      sinon.stub(Notification, 'error');
    });

    afterEach(() => {
      UIComponents.Editor.getCodeMirrorValue.restore();
      Notification.error.restore();
    });

    it('gatherOptions getOptions error', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ ERROR: 'errorTEST' });

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('errorTEST')).to.equal(true);
      expect(UIComponents.Editor.getCodeMirrorValue.callCount).to.equal(0);

      // cleanup
      CollectionAdd.getOptions.restore();
    });

    it('gatherOptions getOptions without error & collation error', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ ERROR: 'errorErrorERROR' });

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-collation', null, { error: 'errorErrorERROR' })).to.equal(true);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
    });

    it('gatherOptions getOptions without error & collation error', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ ERROR: 'errorErrorERROR' });

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-collation', null, { error: 'errorErrorERROR' })).to.equal(true);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
    });

    it('gatherOptions getOptions without error & pipeline error & view', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ a: 1 }).withArgs(pipelineVal)
        .returns({ ERROR: 'ERRORPIPE' });
      sinon.stub($.prototype, 'val').returns('view');

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-pipeline', null, { error: 'ERRORPIPE' })).to.equal(true);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      $.prototype.val.restore();
    });

    it('gatherOptions getOptions without error & view', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ d: 1 }).withArgs(pipelineVal)
        .returns({ e: 2 });
      sinon.stub($.prototype, 'val').returns('view');

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.eql({ a: 'x', b: 123, c: true, collation: { d: 1 }, pipeline: { e: 2 }, viewOn: 'view' });
      expect(Notification.error.callCount).to.equal(0);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      $.prototype.val.restore();
    });

    it('gatherOptions getOptions without error & collection', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ d: 1 }).withArgs(pipelineVal)
        .returns({ e: 2 })
        .withArgs(storageEngineVal)
        .returns({ f: 3 })
        .withArgs(validatorVal)
        .returns({ g: 4 });
      sinon.stub($.prototype, 'val').returns('VAL'); // this works for all val valls :/

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.eql({ a: 'x', b: 123, c: true, storageEngine: { f: 3 }, collation: { d: 1 }, validator: { g: 4 }, validationAction: 'VAL', validationLevel: 'VAL' });
      expect(Notification.error.callCount).to.equal(0);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      $.prototype.val.restore();
    });

    it('gatherOptions getOptions without error & storageEngine error & collection', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ d: 1 }).withArgs(pipelineVal)
        .returns({ e: 2 })
        .withArgs(storageEngineVal)
        .returns({ ERROR: 3 })
        .withArgs(validatorVal)
        .returns({ g: 4 });
      sinon.stub($.prototype, 'val').returns('VAL'); // this works for all val valls :/

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-storage-engine', null, { error: 3 })).to.equal(true);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      $.prototype.val.restore();
    });

    it('gatherOptions getOptions without error & validator error & collection', () => {
      // prepare
      sinon.stub(CollectionAdd, 'getOptions').returns({ a: 'x', b: 123, c: true });
      sinon.stub(ExtendedJSON, 'convertAndCheckJSON').withArgs(collationVal).returns({ d: 1 }).withArgs(pipelineVal)
        .returns({ e: 2 })
        .withArgs(storageEngineVal)
        .returns({ f: 3 })
        .withArgs(validatorVal)
        .returns({ ERROR: 4 });
      sinon.stub($.prototype, 'val').returns('VAL'); // this works for all val valls :/

      // execute
      const result = CollectionAdd.gatherOptions();

      // verify
      expect(result).to.equal(undefined);
      expect(Notification.error.callCount).to.equal(1);
      expect(Notification.error.calledWithExactly('syntax-error-validator', null, { error: 4 })).to.equal(true);

      // cleanup
      CollectionAdd.getOptions.restore();
      ExtendedJSON.convertAndCheckJSON.restore();
      $.prototype.val.restore();
    });
  });

  describe('prepareFormAsCollection tests', () => {
    let propStub;
    beforeEach(() => {
      propStub = {
        trigger: sinon.stub()
      };
      sinon.stub($.prototype, 'hide');
      sinon.stub($.prototype, 'attr');
      sinon.stub($.prototype, 'prop').returns(propStub);
    });

    afterEach(() => {
      $.prototype.hide.restore();
      $.prototype.attr.restore();
      $.prototype.prop.restore();
    });

    it('prepareFormAsCollection', () => {
      // prepare

      // execute
      CollectionAdd.prepareFormAsCollection();

      // verify
      expect($.prototype.hide.callCount).to.equal(1);
      expect($.prototype.hide.getCall(0).thisValue.selector).to.equal('#divViewCollections, #divViewPipelineFormGroup');
      expect($.prototype.hide.calledWithExactly()).to.equal(true);
      expect($.prototype.attr.callCount).to.equal(1);
      expect($.prototype.attr.getCall(0).thisValue.selector).to.equal('#anchorStorageEngine, #anchorValidator');
      expect($.prototype.attr.calledWithExactly('data-toggle', 'tab')).to.equal(true);
      expect($.prototype.prop.callCount).to.equal(1);
      expect($.prototype.prop.getCall(0).thisValue.selector).to.equal('#cmbAddCollectionViewOptions');
      expect($.prototype.prop.calledWithExactly('disabled', false)).to.equal(true);
      expect(propStub.trigger.callCount).to.equal(1);
      expect(propStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    });
  });

  describe('prepareFormAsView tests', () => {
    let findStub;
    beforeEach(() => {
      findStub = {
        removeAttr: sinon.stub(),
        prop: sinon.stub().returnsThis(),
        trigger: sinon.stub(),
        show: sinon.stub()
      };
      sinon.stub($.prototype, 'prop');
      sinon.stub($.prototype, 'find').returns(findStub);
      sinon.stub(SessionManager, 'set');
      sinon.stub(UIComponents.Combobox, 'initializeCollectionsCombobox');
      sinon.stub(UIComponents.Editor, 'initializeCodeMirror');
    });

    afterEach(() => {
      $.prototype.prop.restore();
      $.prototype.find.restore();
      SessionManager.set.restore();
      UIComponents.Combobox.initializeCollectionsCombobox.restore();
      UIComponents.Editor.initializeCodeMirror.restore();
    });

    it('prepareFormAsView', () => {
      // prepare

      // execute
      CollectionAdd.prepareFormAsView();

      // verify
      expect($.prototype.prop.callCount).to.equal(1);
      expect($.prototype.prop.getCall(0).thisValue.selector).to.equal('#cmbAddCollectionViewOptions');
      expect($.prototype.prop.calledWithExactly('disabled', true)).to.equal(true);
      expect(findStub.removeAttr.callCount).to.equal(1);
      expect(findStub.removeAttr.calledWithExactly('data-toggle')).to.equal(true);
      expect(findStub.prop.callCount).to.equal(1);
      expect(findStub.prop.calledWithExactly('selected', false)).to.equal(true);
      expect(findStub.trigger.callCount).to.equal(1);
      expect(findStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
      expect(findStub.show.callCount).to.equal(1);
      expect(findStub.show.calledWithExactly()).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedAddCollectionOptions, [])).to.equal(true);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.callCount).to.equal(1);
      expect(UIComponents.Combobox.initializeCollectionsCombobox.calledWithExactly($('#cmbCollectionsViewOn'))).to.equal(true);
      expect(UIComponents.Editor.initializeCodeMirror.callCount).to.equal(1);
      expect(UIComponents.Editor.initializeCodeMirror.calledWithMatch({ divSelector: $('#divViewPipeline'), txtAreaId: 'txtViewPipeline' })).to.equal(true);
    });
  });

  describe('setStorageEngineAndValidator tests', () => {
    let valStub;
    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };

      sinon.stub($.prototype, 'val').returns(valStub);
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
    });

    afterEach(() => {
      $.prototype.val.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
    });

    it('setStorageEngineAndValidator with invalid param', () => {
      // prepare

      // execute
      CollectionAdd.setStorageEngineAndValidator();

      // verify
      expect(valStub.trigger.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('setStorageEngineAndValidator with invalid param (1)', () => {
      // prepare

      // execute
      CollectionAdd.setStorageEngineAndValidator('invalid');

      // verify
      expect(valStub.trigger.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('setStorageEngineAndValidator with valid param', () => {
      // prepare
      const storageEngine = { x: 1, y: true };

      // execute
      CollectionAdd.setStorageEngineAndValidator({ options: { storageEngine } });

      // verify
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divStorageEngine'), JSON.stringify(storageEngine), $('#txtStorageEngine'))).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(0);
    });

    it('setStorageEngineAndValidator with valid param (1)', () => {
      // prepare
      const storageEngine = { x: 1, y: true };
      const validator = { z: 'sercan' };
      const validationAction = 'ERROR';

      // execute
      CollectionAdd.setStorageEngineAndValidator({ options: { storageEngine, validator, validationAction } });

      // verify
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(2);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divStorageEngine'), JSON.stringify(storageEngine), $('#txtStorageEngine'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divValidatorAddCollection'), JSON.stringify(validator), $('#txtValidatorAddCollection'))).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly(validationAction)).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(1);
      expect(valStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    });


    it('setStorageEngineAndValidator with valid param (2)', () => {
      // prepare
      const storageEngine = { x: 1, y: true };
      const validator = { z: 'sercan' };
      const validationAction = 'ERROR';
      const validationLevel = 'OFF';

      // execute
      CollectionAdd.setStorageEngineAndValidator({ options: { storageEngine, validator, validationAction, validationLevel } });

      // verify
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(2);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divStorageEngine'), JSON.stringify(storageEngine), $('#txtStorageEngine'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divValidatorAddCollection'), JSON.stringify(validator), $('#txtValidatorAddCollection'))).to.equal(true);
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.calledWithExactly(validationAction)).to.equal(true);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#cmbValidationActionAddCollection');
      expect($.prototype.val.calledWithExactly(validationLevel)).to.equal(true);
      expect($.prototype.val.getCall(1).thisValue.selector).to.equal('#cmbValidationLevelAddCollection');
      expect(valStub.trigger.callCount).to.equal(2);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
    });
  });

  describe('setOptionsForCollection tests', () => {
    let clock;
    let valStub;

    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };
      clock = sinon.useFakeTimers();
      sinon.stub($.prototype, 'val').returns(valStub);
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
      sinon.stub(UIComponents.Checkbox, 'toggleState');
    });

    afterEach(() => {
      clock.restore();
      $.prototype.val.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
      UIComponents.Checkbox.toggleState.restore();
    });

    it('setOptionsForCollection with invalid param', () => {
      // prepare

      // execute
      CollectionAdd.setOptionsForCollection();

      // verify
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Checkbox.toggleState.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('setOptionsForCollection with invalid param (1)', () => {
      // prepare

      // execute
      CollectionAdd.setOptionsForCollection('invalid');

      // verify
      expect($.prototype.val.callCount).to.equal(0);
      expect(UIComponents.Checkbox.toggleState.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
    });

    it('setOptionsForCollection with valid param without tick', () => {
      // prepare

      // execute
      CollectionAdd.setOptionsForCollection({ options: { capped: true, max: 30, size: 1, flags: 1, indexOptionDefaults: { x: 1, y: 2 } } });

      // verify
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
      expect(UIComponents.Checkbox.toggleState.callCount).to.equal(0);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly(['CAPPED', 'FLAGS', 'INDEX_OPTION_DEFAULTS'])).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(1);
      expect(valStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    });

    it('setOptionsForCollection with valid param with tick', () => {
      // prepare
      const indexOptionDefaults = { x: 1, y: 2 };
      const max = 30;
      const size = 1;

      // execute
      CollectionAdd.setOptionsForCollection({ options: { capped: true, max, size, flags: 1, indexOptionDefaults } });

      // verify
      clock.tick(150);

      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(1);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divIndexOptionDefaults'), JSON.stringify(indexOptionDefaults), $('#txtIndexOptionDefaults'))).to.equal(true);
      expect(UIComponents.Checkbox.toggleState.callCount).to.equal(2);
      expect(UIComponents.Checkbox.toggleState.calledWithExactly($('#inputTwoSizesIndexes'), 'check')).to.equal(true);
      expect(UIComponents.Checkbox.toggleState.calledWithExactly($('#inputNoPadding'), 'uncheck')).to.equal(true);
      expect($.prototype.val.callCount).to.equal(3);
      expect($.prototype.val.calledWithExactly(max)).to.equal(true);
      expect($.prototype.val.calledWithExactly(size)).to.equal(true);
      expect($.prototype.val.calledWithExactly(['CAPPED', 'FLAGS', 'INDEX_OPTION_DEFAULTS'])).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(1);
      expect(valStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
    });
  });

  describe('prepareShowForm tests', () => {
    let valStub;
    const viewInfoTranslated = 'View';
    const collectionInfoTranslated = 'Collection';

    const assertView = function (name, pipeline, collation, viewOn) {
      expect($.prototype.tab.callCount).to.equal(1);
      expect($.prototype.tab.calledWithExactly('show')).to.equal(true);
      expect($.prototype.tab.getCall(0).thisValue.selector).to.equal('.nav-tabs a[href="#tab-1-options"]');
      expect($.prototype.text.callCount).to.equal(2);
      expect($.prototype.text.calledWithExactly(viewInfoTranslated)).to.equal(true);
      expect($.prototype.text.getCall(0).thisValue.selector).to.equal('#collectionAddModalTitle');
      expect($.prototype.text.calledWithExactly(name)).to.equal(true);
      expect($.prototype.text.getCall(1).thisValue.selector).to.equal('#spanColName');

      expect($.prototype.val.callCount).to.equal(viewOn ? 3 : 2);
      if (viewOn)expect($.prototype.val.calledWithExactly(viewOn)).to.equal(true);

      expect($.prototype.val.calledWithExactly('view')).to.equal(true);
      expect($.prototype.val.calledWithExactly(name)).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(viewOn ? 2 : 1);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
      expect($.prototype.prop.callCount).to.equal(1);
      expect($.prototype.prop.calledWithExactly('disabled', true)).to.equal(true);
      expect($.prototype.prop.getCall(0).thisValue.selector).to.equal('#btnCreateCollection');

      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(pipeline ? 2 : 0);
      if (pipeline)expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divViewPipeline'), JSON.stringify(pipeline), $('#txtViewPipeline'))).to.equal(true);
      if (collation)expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divCollationAddCollection'), JSON.stringify(collation), $('#txtCollationAddCollection'))).to.equal(true);

      expect(CollectionAdd.prepareFormAsView.callCount).to.equal(1);
      expect(CollectionAdd.prepareFormAsView.calledWithExactly()).to.equal(true);
      expect(CollectionAdd.setStorageEngineAndValidator.callCount).to.equal(0);
      expect(CollectionAdd.prepareFormAsCollection.callCount).to.equal(0);
      expect(CollectionAdd.setOptionsForCollection.callCount).to.equal(0);
    };

    const assertCollection = function (collection) {
      expect($.prototype.tab.callCount).to.equal(1);
      expect($.prototype.tab.calledWithExactly('show')).to.equal(true);
      expect($.prototype.tab.getCall(0).thisValue.selector).to.equal('.nav-tabs a[href="#tab-1-options"]');
      expect($.prototype.text.callCount).to.equal(2);
      expect($.prototype.text.calledWithExactly(collectionInfoTranslated)).to.equal(true);
      expect($.prototype.text.getCall(0).thisValue.selector).to.equal('#collectionAddModalTitle');
      expect($.prototype.text.calledWithExactly(collection.name)).to.equal(true);
      expect($.prototype.text.getCall(1).thisValue.selector).to.equal('#spanColName');
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.calledWithExactly('collection')).to.equal(true);
      expect($.prototype.val.calledWithExactly(collection.name)).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(1);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
      expect($.prototype.prop.callCount).to.equal(1);
      expect($.prototype.prop.calledWithExactly('disabled', true)).to.equal(true);
      expect($.prototype.prop.getCall(0).thisValue.selector).to.equal('#btnCreateCollection');
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal((collection.options && collection.options.collation) ? 1 : 0);
      if (collection.options && collection.options.collation) {
        expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divCollationAddCollection'), JSON.stringify(collection.options.collation), $('#txtCollationAddCollection'))).to.equal(true);
      }
      expect(CollectionAdd.prepareFormAsView.callCount).to.equal(0);
      expect(CollectionAdd.prepareFormAsCollection.callCount).to.equal(1);
      expect(CollectionAdd.prepareFormAsCollection.calledWithExactly()).to.equal(true);
      expect(CollectionAdd.setStorageEngineAndValidator.callCount).to.equal(1);
      expect(CollectionAdd.setStorageEngineAndValidator.calledWithExactly(collection)).to.equal(true);
      expect(CollectionAdd.setOptionsForCollection.callCount).to.equal(1);
      expect(CollectionAdd.setOptionsForCollection.calledWithExactly(collection)).to.equal(true);
    };

    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };
      sinon.stub($.prototype, 'val').returns(valStub);
      sinon.stub($.prototype, 'text');
      sinon.stub($.prototype, 'prop');
      sinon.stub($.prototype, 'tab');
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
      sinon.stub(CollectionAdd, 'prepareFormAsView');
      sinon.stub(CollectionAdd, 'prepareFormAsCollection');
      sinon.stub(CollectionAdd, 'setStorageEngineAndValidator');
      sinon.stub(CollectionAdd, 'setOptionsForCollection');
      sinon.stub(Helper, 'translate').withArgs({ key: 'view_info' }).returns(viewInfoTranslated).withArgs({ key: 'collection_info' })
        .returns(collectionInfoTranslated);
    });

    afterEach(() => {
      $.prototype.val.restore();
      $.prototype.text.restore();
      $.prototype.prop.restore();
      $.prototype.tab.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
      CollectionAdd.prepareFormAsView.restore();
      CollectionAdd.prepareFormAsCollection.restore();
      CollectionAdd.setStorageEngineAndValidator.restore();
      CollectionAdd.setOptionsForCollection.restore();
      Helper.translate.restore();
    });

    it('prepareShowForm with invalid param', () => {
      // prepare

      // execute
      CollectionAdd.prepareShowForm();

      // verify
      expect($.prototype.val.callCount).to.equal(0);
      expect($.prototype.text.callCount).to.equal(0);
      expect($.prototype.prop.callCount).to.equal(0);
      expect($.prototype.tab.callCount).to.equal(0);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(0);
      expect(CollectionAdd.prepareFormAsView.callCount).to.equal(0);
      expect(CollectionAdd.setStorageEngineAndValidator.callCount).to.equal(0);
      expect(CollectionAdd.prepareFormAsCollection.callCount).to.equal(0);
      expect(CollectionAdd.setOptionsForCollection.callCount).to.equal(0);
    });

    it('prepareShowForm with valid param view', () => {
      // prepare
      const pipeline = [{ $limit: 1 }];
      const collation = { x: 1, y: true, z: 'sercan' };
      const viewOn = 'me';
      const name = 'VIEW_NAME';

      // execute
      CollectionAdd.prepareShowForm({ type: 'view', name, options: { pipeline, viewOn, collation } });

      // verify
      assertView(name, pipeline, collation, viewOn);
    });

    it('prepareShowForm with valid param view (1)', () => {
      // prepare
      const pipeline = [{ $limit: 1 }];
      const collation = { x: 1, y: true, z: 'sercan' };
      const name = 'VIEW_NAME';

      // execute
      CollectionAdd.prepareShowForm({ type: 'view', name, options: { pipeline, collation } });

      // verify
      assertView(name, pipeline, collation);
    });

    it('prepareShowForm with valid param view (2)', () => {
      // prepare
      const name = 'VIEW_NAME';

      // execute
      CollectionAdd.prepareShowForm({ type: 'view', name });

      // verify
      assertView(name);
    });

    it('prepareShowForm with valid param view (3)', () => {
      // prepare

      // execute
      CollectionAdd.prepareShowForm({ type: 'view' });

      // verify
      assertView();
    });

    it('prepareShowForm with valid param collection', () => {
      // prepare
      const pipeline = [{ $limit: 1 }];
      const collation = { x: 1, y: true, z: 'sercan' };
      const viewOn = 'me';
      const name = 'COL_NAME';
      const collection = { type: 'collection', name, options: { pipeline, viewOn, collation } };

      // execute
      CollectionAdd.prepareShowForm(collection);

      // verify
      assertCollection(collection);
    });

    it('prepareShowForm with valid param collection (1)', () => {
      // prepare
      const collection = { type: 'collection' };

      // execute
      CollectionAdd.prepareShowForm(collection);

      // verify
      assertCollection(collection);
    });
  });

  describe('resetForm tests', () => {
    let findStub;
    const createCollectionInfo = 'CREATE COLLECTION';
    const connection = { connectionName: 'TEST_CONNECTION' };
    const connectionId = 123;

    beforeEach(() => {
      findStub = {
        val: sinon.stub(),
        find: sinon.stub().returnsThis(),
        tab: sinon.stub(),
        prop: sinon.stub().returnsThis(),
        trigger: sinon.stub()
      };
      sinon.stub($.prototype, 'find').returns(findStub);
      sinon.stub($.prototype, 'text');
      sinon.stub($.prototype, 'prop');
      sinon.stub(UIComponents.Editor, 'setCodeMirrorValue');
      sinon.stub(UIComponents.Checkbox, 'toggleState');
      sinon.stub(CollectionAdd, 'prepareFormAsCollection');
      sinon.stub(Helper, 'translate').withArgs({ key: 'create_collection_view' }).returns(createCollectionInfo);
      sinon.stub(ReactivityProvider, 'findOne').returns(connection);
      sinon.stub(SessionManager, 'get').withArgs(SessionManager.strSessionConnection).returns({ _id: connectionId });
      sinon.stub(SessionManager, 'set');
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.prototype.prop.restore();
      $.prototype.text.restore();
      UIComponents.Editor.setCodeMirrorValue.restore();
      UIComponents.Checkbox.toggleState.restore();
      CollectionAdd.prepareFormAsCollection.restore();
      Helper.translate.restore();
      ReactivityProvider.findOne.restore();
      SessionManager.get.restore();
      SessionManager.set.restore();
    });

    it('resetForm', () => {
      // prepare

      // execute
      CollectionAdd.resetForm();

      // verify
      expect(CollectionAdd.prepareFormAsCollection.callCount).to.equal(1);
      expect(CollectionAdd.prepareFormAsCollection.calledWithExactly()).to.equal(true);
      expect(findStub.tab.callCount).to.equal(1);
      expect(findStub.tab.calledWithExactly('show')).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.callCount).to.equal(5);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divValidatorAddCollection'), '', $('#txtValidatorAddCollection'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divStorageEngine'), '', $('#txtStorageEngine'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divCollationAddCollection'), '', $('#txtCollationAddCollection'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divIndexOptionDefaults'), '', $('#txtIndexOptionDefaults'))).to.equal(true);
      expect(UIComponents.Editor.setCodeMirrorValue.calledWithExactly($('#divViewPipeline'), '', $('#txtViewPipeline'))).to.equal(true);
      expect(findStub.val.callCount).to.equal(1);
      expect(findStub.val.calledWithExactly('')).to.equal(true);
      expect(UIComponents.Checkbox.toggleState.callCount).to.equal(1);
      expect(UIComponents.Checkbox.toggleState.calledWithExactly($('#inputNoPadding, #inputTwoSizesIndexes'), 'uncheck')).to.equal(true);
      expect(findStub.prop.callCount).to.equal(1);
      expect(findStub.prop.calledWithExactly('selected', false)).to.equal(true);
      expect($.prototype.prop.calledWithExactly('disabled', false)).to.equal(true);
      expect(findStub.trigger.callCount).to.equal(1);
      expect(findStub.trigger.calledWithExactly('chosen:updated')).to.equal(true);
      expect($.prototype.text.callCount).to.equal(2);
      expect($.prototype.text.calledWithExactly(createCollectionInfo)).to.equal(true);
      expect($.prototype.text.calledWithExactly(connection.connectionName)).to.equal(true);
      expect(ReactivityProvider.findOne.callCount).to.equal(1);
      expect(ReactivityProvider.findOne.calledWithExactly(ReactivityProvider.types.Connections, { _id: connectionId })).to.equal(true);
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedAddCollectionOptions, [])).to.equal(true);
    });
  });

  describe('addCollection tests', () => {
    const assertNoExecution = function (isNameError) {
      if (isNameError) {
        expect(Notification.warning.callCount).to.equal(1);
        expect(Notification.warning.calledWithExactly('name-required')).to.equal(true);
      } else {
        expect(Notification.warning.callCount).to.equal(0);
      }
      expect(Notification.start.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(0);
    };

    beforeEach(() => {
      sinon.stub($.prototype, 'modal');
      sinon.stub(Notification, 'warning');
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'success');
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
    });

    afterEach(() => {
      $.prototype.modal.restore();
      Notification.warning.restore();
      Notification.start.restore();
      Notification.success.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
    });

    it('addCollection name filled & options correct & communicator yields error', () => {
      // prepare
      const name = 'sercan';
      const options = { x: 1, y: 2, z: true };
      const error = { error: 'sercan' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);
      sinon.stub($.prototype, 'val').returns(name);
      sinon.stub(CollectionAdd, 'gatherOptions').returns(options);

      // execute
      CollectionAdd.addCollection();

      // verify
      expect(Notification.warning.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnCreateCollection')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'createCollection', args: { collectionName: name, options }, callback: sinon.match.func })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithMatch(error, undefined)).to.equal(true);
      expect(Connection.connect.callCount).to.equal(0);
      expect($.prototype.modal.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(0);

      // cleanup
      Communicator.call.restore();
      $.prototype.val.restore();
      CollectionAdd.gatherOptions.restore();
    });

    it('addCollection name empty', () => {
      // prepare
      const name = '';
      const options = { x: 1, y: 2, z: true };
      const error = { error: 'sercan' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);
      sinon.stub($.prototype, 'val').returns(name);
      sinon.stub(CollectionAdd, 'gatherOptions').returns(options);

      // execute
      CollectionAdd.addCollection();

      // verify
      assertNoExecution(true);

      // cleanup
      Communicator.call.restore();
      $.prototype.val.restore();
      CollectionAdd.gatherOptions.restore();
    });


    it('addCollection name filled & options wrong & communicator yields error', () => {
      // prepare
      const name = 'sercan';
      const options = null;
      const error = { error: 'sercan' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error);
      sinon.stub($.prototype, 'val').returns(name);
      sinon.stub(CollectionAdd, 'gatherOptions').returns(options);

      // execute
      CollectionAdd.addCollection();

      // verify
      assertNoExecution();

      // cleanup
      Communicator.call.restore();
      $.prototype.val.restore();
      CollectionAdd.gatherOptions.restore();
    });

    it('addCollection name filled & options correct & communicator yields success', () => {
      // prepare
      const name = 'sercan';
      const options = { x: 1, y: 2, z: true };
      const success = { success: 'sercan' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, success);
      sinon.stub($.prototype, 'val').returns(name);
      sinon.stub(CollectionAdd, 'gatherOptions').returns(options);

      // execute
      CollectionAdd.addCollection();

      // verify
      expect(Notification.warning.callCount).to.equal(0);
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnCreateCollection')).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({ methodName: 'createCollection', args: { collectionName: name, options }, callback: sinon.match.func })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly()).to.equal(true);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#collectionAddModal');
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-created-successfully', null, { name })).to.equal(true);

      // cleanup
      Communicator.call.restore();
      $.prototype.val.restore();
      CollectionAdd.gatherOptions.restore();
    });
  });
});
