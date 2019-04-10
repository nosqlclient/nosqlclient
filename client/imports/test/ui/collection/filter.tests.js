/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { CollectionFilter } from '/client/imports/ui/collection';

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
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#collectionFilterModal');

      // cleanup
      $.prototype.val.restore();
    });

    it('applyFilter without regex & excludedCollectionsByFilter with checked', () => {
      // prepare
      const excludedCollection = { name: 'sercan', checked: true };
      sinon.stub($.prototype, 'DataTable').returns({
        $: sinon.stub().returnsThis(),
        each: sinon.stub().yieldsOn(excludedCollection)
      });
      sinon.stub($.prototype, 'val').returns('');

      // execute
      CollectionFilter.applyFilter();

      // verify
      expect(CollectionFilter.filterRegex.get()).to.equal('');
      expect(CollectionFilter.excludedCollectionsByFilter.get()).to.eql([]);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#collectionFilterModal');

      // cleanup
      $.prototype.DataTable.restore();
      $.prototype.val.restore();
    });

    it('applyFilter without regex & excludedCollectionsByFilter with unchecked', () => {
      // prepare
      const excludedCollection = { name: 'sercan' };
      sinon.stub($.prototype, 'DataTable').returns({
        $: sinon.stub().returnsThis(),
        each: sinon.stub().yieldsOn(excludedCollection)
      });
      sinon.stub($.prototype, 'val').returns('');

      // execute
      CollectionFilter.applyFilter();

      // verify
      expect(CollectionFilter.filterRegex.get()).to.equal('');
      expect(CollectionFilter.excludedCollectionsByFilter.get()).to.eql(['sercan']);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#collectionFilterModal');

      // cleanup
      $.prototype.DataTable.restore();
      $.prototype.val.restore();
    });

    it('applyFilter with regex & excludedCollectionsByFilter with unchecked', () => {
      // prepare
      const regex = '^^\'=^)%';
      const excludedCollection = { name: 'sercan' };
      sinon.stub($.prototype, 'DataTable').returns({
        $: sinon.stub().returnsThis(),
        each: sinon.stub().yieldsOn(excludedCollection)
      });
      sinon.stub($.prototype, 'val').returns(regex);

      // execute
      CollectionFilter.applyFilter();

      // verify
      expect(CollectionFilter.filterRegex.get()).to.equal(regex);
      expect(CollectionFilter.excludedCollectionsByFilter.get()).to.eql(['sercan']);
      expect($.prototype.modal.callCount).to.equal(1);
      expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
      expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#collectionFilterModal');

      // cleanup
      $.prototype.DataTable.restore();
      $.prototype.val.restore();
    });
  });

  describe('initializeFilterTable tests', () => {
    beforeEach(() => {
      sinon.stub($.prototype, 'val');
      sinon.stub(UIComponents.DataTable, 'setupDatatable');
    });

    afterEach(() => {
      $.prototype.val.restore();
      UIComponents.DataTable.setupDatatable.restore();
    });

    it('initializeFilterTable with no collection & no exclusion', () => {
      // prepare
      sinon.stub(SessionManager, 'get').returns(null);

      // execute
      CollectionFilter.initializeFilterTable();

      // verify
      expect(UIComponents.DataTable.setupDatatable.callCount).to.equal(1);
      expect(UIComponents.DataTable.setupDatatable.calledWithMatch({
        selectorString: '#tblCollectionFilter',
        data: [],
        columns: [
          { data: 'name' },
          { data: 'type' },
        ],
        columnDefs: [
          {
            targets: [2],
            data: null,
            width: '10%',
            render: sinon.match.func // no proper way to test...
          },
        ]
      })).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#inputFilterRegex');
      expect($.prototype.val.calledWithExactly('')).to.equal(true);

      // cleanup
      SessionManager.get.restore();
    });

    it('initializeFilterTable with collections & exclusion', () => {
      // prepare
      const collections = [{ name: 'sercan' }, { name: 'tugce', type: 'view' }];

      sinon.stub(SessionManager, 'get').returns(collections);
      CollectionFilter.excludedCollectionsByFilter.set(['tugce']);

      // execute
      CollectionFilter.initializeFilterTable();

      // verify
      collections[0].type = 'collection'; // it gets automatically if there's no type

      expect(UIComponents.DataTable.setupDatatable.callCount).to.equal(1);
      expect(UIComponents.DataTable.setupDatatable.calledWithMatch({
        selectorString: '#tblCollectionFilter',
        data: collections,
        columns: [
          { data: 'name' },
          { data: 'type' },
        ],
        columnDefs: [
          {
            targets: [2],
            data: null,
            width: '10%',
            render: sinon.match.func
          },
        ]
      })).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#inputFilterRegex');
      expect($.prototype.val.calledWithExactly('')).to.equal(true);

      // cleanup
      SessionManager.get.restore();
    });


    it('initializeFilterTable with collections & regex', () => {
      // prepare
      const regex = '^]!!ç';
      const collections = [{ name: 'sercan' }, { name: 'tugce', type: 'view' }];
      CollectionFilter.filterRegex.set(regex);
      sinon.stub(SessionManager, 'get').returns(collections);

      // execute
      CollectionFilter.initializeFilterTable();

      // verify
      collections[0].type = 'collection'; // it gets automatically if there's no type

      expect(UIComponents.DataTable.setupDatatable.callCount).to.equal(1);
      expect(UIComponents.DataTable.setupDatatable.calledWithMatch({
        selectorString: '#tblCollectionFilter',
        data: collections,
        columns: [
          { data: 'name' },
          { data: 'type' },
        ],
        columnDefs: [
          {
            targets: [2],
            data: null,
            width: '10%',
            render: sinon.match.func
          },
        ]
      })).to.equal(true);
      expect($.prototype.val.callCount).to.equal(1);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#inputFilterRegex');
      expect($.prototype.val.calledWithExactly(regex)).to.equal(true);

      // cleanup
      SessionManager.get.restore();
    });
  });
});
