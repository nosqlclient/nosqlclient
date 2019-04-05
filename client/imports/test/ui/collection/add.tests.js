/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionAdd } from '/client/imports/ui';
import { Enums, ExtendedJSON, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import $ from 'jquery';
import Helper from '../../../helpers/helper';

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
});
