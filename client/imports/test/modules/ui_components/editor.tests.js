/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';

const Ace = require('ace-builds');

describe('UIComponents Editor', () => {
  describe('getAceEditorValue tests', () => {
    const exist = $('<pre id="exist" style="height: 500px"></pre>');
    const notExist = $('<pre id="notExist" style="height: 500px"></pre>');
    const editor = Ace.edit(exist);

    beforeEach(() => {
      sinon.stub(Ace, 'edit').withArgs(exist).returnsThis(editor).withArgs(notExist)
        .returns(null);
      sinon.stub(editor, 'getValue').returns('{ test:213 }');
    });

    afterEach(() => {
      Ace.edit.restore();
      Ace.Editor.getValue.restore();
    });

    it('getAceEditorValue with ace editor exist', () => {
      // prepare

      // execute
      const result = UIComponents.Editor.getAceEditorValue(exist);

      // verify
      expect(Ace.edit.callCount).to.equal(1);
      expect(Ace.edit.calledWithExactly(exist)).to.equal(true);
      expect(editor.getValue.callCount).to.equal(1);
      expect(editor.getValue.calledWithExactly()).to.equal(true);
      expect(editor.getValue.returns('{ test:213 }')).to.equal(true);
      expect(result).to.equal('{ test:213 }');
    });
  });
});
