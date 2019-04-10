/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { Notification } from '/client/imports/modules';
import CollectionHelper from '/client/imports/ui/collection/helper';
import { CollectionConversion } from '/client/imports/ui/collection';

describe('CollectionConversion', () => {
  describe('resetForm tests', () => {
    const collectionName = 'collectionNAME';

    beforeEach(() => {
      sinon.stub($.prototype, 'val');
      sinon.stub($.prototype, 'html');
      sinon.stub($.prototype, 'data').returns(collectionName);
    });

    afterEach(() => {
      $.prototype.val.restore();
      $.prototype.html.restore();
      $.prototype.data.restore();
    });

    it('resetForm', () => {
      // prepare

      // execute
      CollectionConversion.resetForm();

      // verify
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly('')).to.equal(true);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#inputConvertToCappedSize');
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(collectionName)).to.equal(true);
      expect($.prototype.html.getCall(0).thisValue.selector).to.equal('#spanCollectionNameConvertToCapped');
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
    });
  });

  describe('convertToCapped tests', () => {
    beforeEach(() => {
      sinon.stub(Notification, 'start');
      sinon.stub(Notification, 'warning');
      sinon.stub(CollectionHelper, 'executeCommand');
    });

    afterEach(() => {
      Notification.start.restore();
      Notification.warning.restore();
      CollectionHelper.executeCommand.restore();
    });

    it('convertToCapped with no size', () => {
      // prepare
      sinon.stub($.prototype, 'val').returns(null);

      // execute
      CollectionConversion.convertToCapped();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnConvertToCapped')).to.equal(true);
      expect(Notification.warning.callCount).to.equal(1);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly()).to.equal(true);
      expect(Notification.warning.calledWithExactly('size-required')).to.equal(true);
      expect(CollectionHelper.executeCommand.callCount).to.equal(0);

      // cleanup
      $.prototype.val.restore();
    });

    it('convertToCapped with no collectionName', () => {
      // prepare
      const size = '123';
      sinon.stub($.prototype, 'val').returns(size);
      sinon.stub($.prototype, 'data').returns(null);

      // execute
      CollectionConversion.convertToCapped();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnConvertToCapped')).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly()).to.equal(true);
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect(Notification.warning.callCount).to.equal(1);
      expect(Notification.warning.calledWithExactly('collection-not-found')).to.equal(true);
      expect(CollectionHelper.executeCommand.callCount).to.equal(0);

      // cleanup
      $.prototype.val.restore();
      $.prototype.data.restore();
    });

    it('convertToCapped valid call', () => {
      // prepare
      const size = '123';
      const collection = 'sercan';
      sinon.stub($.prototype, 'val').returns(size);
      sinon.stub($.prototype, 'data').returns(collection);

      // execute
      CollectionConversion.convertToCapped();

      // verify
      expect(Notification.start.callCount).to.equal(1);
      expect(Notification.start.calledWithExactly('#btnConvertToCapped')).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.calledWithExactly()).to.equal(true);
      expect($.prototype.data.callCount).to.equal(1);
      expect($.prototype.data.calledWithExactly('collection')).to.equal(true);
      expect(Notification.warning.callCount).to.equal(0);
      expect(CollectionHelper.executeCommand.callCount).to.equal(1);
      expect(CollectionHelper.executeCommand.calledWithExactly({ convertToCapped: collection, size: parseInt(size, 10) }, 'convertToCappedModal')).to.equal(true);

      // cleanup
      $.prototype.val.restore();
      $.prototype.data.restore();
    });
  });
});
