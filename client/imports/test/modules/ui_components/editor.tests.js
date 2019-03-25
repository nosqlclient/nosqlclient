/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';

const Ace = require('ace-builds');
const JSONEditor = require('jsoneditor');

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

  describe('Grid tests', () => {
    const assertNormalExecution = function (tableValue) {
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.calledWithExactly('table')).to.equal(true);
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(tableValue)).to.equal(true);
      expect($.prototype.DataTable.callCount).to.equal(1);
      expect($.prototype.DataTable.calledWithMatch({ paging: false })).to.equal(true);
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWith('dblclick', 'td[title]')).to.equal(true);
    };

    beforeEach(() => {
      sinon.spy($.prototype, 'find');
      sinon.spy($.prototype, 'on');
      sinon.spy($.prototype, 'DataTable');
      sinon.spy($.prototype, 'html');
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.prototype.DataTable.restore();
      $.prototype.on.restore();
      $.prototype.html.restore();
    });

    describe('setGridEditorValue tests', () => {
      it('setGridEditorValue with valid selector & primitive value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: 'test' });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>0</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody>'
          + '<tr><td>t</td><td>e</td><td>s</td><td>t</td></tr></tbody></table>');
      });

      it('setGridEditorValue with valid selector & object value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: { first: 123, second: true, third: { a: 'sercan' } } });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>first</th><th>second</th><th>third</th></tr></thead><tbody>'
          + '<tr><td>123</td><td>true</td><td>{"a":"sercan"}</td></tr></tbody></table>');
      });

      it('setGridEditorValue with valid selector & array value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: [{ first: 123 }, { second: 'test' }] });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>first</th><th>second</th></tr></thead><tbody>'
          + '<tr><td>123</td><td></td></tr><tr><td></td><td>test</td></tr></tbody></table>');
      });

      it('setGridEditorValue with invalid selector & valid value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: '', value: [{ first: 123 }, { second: 'test' }] });

        // verify
        expect($.prototype.find.callCount).to.equal(0);
        expect($.prototype.html.callCount).to.equal(0);
        expect($.prototype.DataTable.callCount).to.equal(0);
        expect($.prototype.on.callCount).to.equal(0);
      });
    });
  });

  describe('JsonEditor tests', () => {
    beforeEach(() => {
      sinon.spy(global, JSONEditor);// FIXME
    });

    afterEach(() => {
      global.JSONEditor.restore();
    });

    describe('initializeJSONEditor tests', () => {
      it('initializeJSONEditor with valid params & no jsoneditor initialized', () => {
        // prepare

        // execute
        UIComponents.Editor.initializeJSONEditor({ selector: 'jsonEditor', setDivData: false });

        // verify
      });
    });
  });
});
