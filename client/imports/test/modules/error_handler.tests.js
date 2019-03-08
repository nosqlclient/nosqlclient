/* eslint-env mocha */

import { ErrorHandler } from '/client/imports/modules';
import { expect } from 'meteor/practicalmeteor:chai';
import Helper from '/client/imports/helpers/helper';
import sinon from 'sinon';

describe('ErrorHandler', () => {
  beforeEach(() => {
    sinon.stub(Helper, 'translate').returns('dummy message');
  });

  afterEach(() => {
    Helper.translate.restore();
  });

  describe('getErrorMessage tests', () => {
    it('expected behaviour', () => {
      // prepare

      // execute
      const errorMessage = ErrorHandler.getErrorMessage({ reason: 'myReason' }, null, null);

      console.log(errorMessage);
      // verify
      expect(errorMessage).to.equal('dummy message: myReason');
    });
  });
});
