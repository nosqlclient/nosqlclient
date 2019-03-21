/*
/!* eslint-env mocha *!/

import { UIComponents } from '/client/imports/modules';
import { AceEditor } from 'meteor/arch:ace-editor';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));

describe('UIComponents Editor', () => {
  describe('getAceEditorValue tests', () => {
    let aceeditorStub;
    const exist = $('<pre id="exist" style="height: 500px"></pre>');
    const notExist = $('<pre id="notExist" style="height: 500px"></pre>');

    beforeEach(() => {
      aceeditorStub = {
        getValue: sinon.stub().returns('{}')
      };
      sinon.stub(AceEditor, 'instance').withArgs(exist).returnsThis().withArgs(notExist)
        .returns(null);
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.prototype.on.restore();
    });
  });
});
*/
