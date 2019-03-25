/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';

const Ace = require('ace-builds');

describe('UIComponents Editor', () => {
  describe('Ace tests', () => {
    const exist = $('<pre id="exist" style="height: 500px"></pre>');
    const notExist = $('<pre id="notExist" style="height: 500px"></pre>');
    let editStub;

    beforeEach(() => {
      // FIXME stub $blockScrolling
      editStub = {
        getValue: sinon.stub().returns('{ test:213 }'),
        setTheme: sinon.stub(),
        session: {
          setMode: sinon.stub()
        },
        setOptions: sinon.stub(),
        setValue: sinon.stub()
      };
      sinon.stub(Ace, 'edit').withArgs(exist).returns(editStub).withArgs(notExist)
        .returns(null);
    });

    afterEach(() => {
      Ace.edit.restore();
    });

    describe('getAceEditorValue tests', () => {
      it('getAceEditorValue with ace editor exist', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue(exist);

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(exist)).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(1);
        expect(editStub.getValue.calledWithExactly()).to.equal(true);
        expect(result).to.equal('{ test:213 }');
      });

      it('getAceEditorValue with ace editor not exist', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue(notExist);

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(notExist)).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(0);
        expect(result).to.equal('');
      });

      it('getAceEditorValue with wrong selector', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue('sercan');

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly('sercan')).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(0);
        expect(result).to.equal('');
      });
    });

    describe('setAceEditorValue tests', () => {
      const assertNoCall = function (selector) {
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(selector)).to.equal(true);
        expect(editStub.setTheme.callCount).to.equal(0);
        expect(editStub.session.setMode.callCount).to.equal(0);
        expect(editStub.setOptions.callCount).to.equal(0);
        expect(editStub.setValue.callCount).to.equal(0);
      };

      const assertCallsExecuted = function (value) {
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(exist)).to.equal(true);
        expect(editStub.setTheme.callCount).to.equal(1);
        expect(editStub.setTheme.calledWithExactly('ace/theme/github')).to.equal(true);
        expect(editStub.session.setMode.callCount).to.equal(1);
        expect(editStub.session.setMode.calledWithExactly('ace/mode/json')).to.equal(true);
        expect(editStub.setOptions.callCount).to.equal(1);
        expect(editStub.setOptions.calledWithMatch({
          fontSize: '14px',
          showLineNumbers: true,
          showPrintMargin: false
        })).to.equal(true);
        expect(editStub.setValue.callCount).to.equal(1);
        expect(editStub.setValue.calledWithExactly(value, -1)).to.equal(true);
      };

      it('setAceEditorValue with ace editor exist and value exist', () => {
        // prepare
        const arg = { selector: exist, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertCallsExecuted('"testing_value"');
      });

      it('setAceEditorValue with ace editor not exist and value exist', () => {
        // prepare
        const arg = { selector: notExist, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertNoCall(notExist);
      });

      it('setAceEditorValue with ace editor exist and value not exist', () => {
        // prepare
        const arg = { selector: exist };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertCallsExecuted();
      });

      it('setAceEditorValue with ace editor selector wrong and value exist', () => {
        // prepare
        const selector = 'asdasd^^213';
        const arg = { selector, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertNoCall(selector);
      });
    });
  });
});
