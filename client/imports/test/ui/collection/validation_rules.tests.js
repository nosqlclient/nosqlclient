/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { UIComponents } from '/client/imports/modules';
import { CollectionValidationRules } from '/client/imports/ui/collection';
import Helper from '/client/imports/helpers/helper';

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
});
