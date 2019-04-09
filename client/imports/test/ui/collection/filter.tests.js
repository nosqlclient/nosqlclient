/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { SessionManager } from '/client/imports/modules';
import CollectionFilter from '/client/imports/ui/collection/filter';
import { ReactiveVar } from 'meteor/reactive-var';

describe('CollectionFilter', () => {
  afterEach(() => {
    CollectionFilter.filterRegex.set('');
    CollectionFilter.excludedCollectionsByFilter.set([]);
  });

  describe('isFiltered tests', () => {
    it('isFiltered regex exist', () => {
      // prepare
      CollectionFilter.filterRegex.set('^.a');

      // execute
      const filtered = CollectionFilter.isFiltered();

      // verify
      expect(filtered).to.equal(true);
    });

    it('isFiltered regex does not exist & excludedCollectionsByFilter exist', () => {
      // prepare
      CollectionFilter.excludedCollectionsByFilter.set(['test']);

      // execute
      const filtered = CollectionFilter.isFiltered();

      // verify
      expect(filtered).to.equal(true);
    });

    it('isFiltered regex does not exist & excludedCollectionsByFilter does not exist', () => {
      // prepare
      // execute
      const filtered = CollectionFilter.isFiltered();

      // verify
      expect(filtered).to.equal(false);
    });
  });

  describe('applyFilter tests', () => {
    beforeEach(() => {
      sinon.stub($.prototype, 'modal');
    });

    afterEach(() => {
      $.prototype.modal.restore();
    });

    it('applyFilter only with regex', () => {
      // prepare
      const regex = '^a.*';
      sinon.stub($.prototype, 'val').returns(regex);

      // execute
      CollectionFilter.applyFilter();

      // verify
      expect(CollectionFilter.filterRegex.get()).to.equal(regex);
      expect(CollectionFilter.excludedCollectionsByFilter.get()).to.eql([]);

      // cleanup
      $.prototype.val.restore();
    });

    it('applyFilter without regex & excludedCollectionsByFilter', () => {
      // prepare
      const excludedCollections = [{ name: 'sercan', checked: true }, { name: 'tugce' }];
      sinon.stub($.prototype, 'find').returns({
        DataTable: sinon.stub().returnsThis(),
        find: sinon.stub().returns(excludedCollections)
      });

      // execute
      CollectionFilter.applyFilter();

      // verify
      expect(CollectionFilter.filterRegex.get()).to.equal('');
      expect(CollectionFilter.excludedCollectionsByFilter.get()).to.eql(['tugce']);

      // cleanup
      $.prototype.find.restore();
    });
  });
});
