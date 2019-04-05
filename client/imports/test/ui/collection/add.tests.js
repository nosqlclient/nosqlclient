/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionAdd } from '/client/imports/ui';
import { Enums, SessionManager, UIComponents } from '/client/imports/modules';
import $ from 'jquery';

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
  });
});
