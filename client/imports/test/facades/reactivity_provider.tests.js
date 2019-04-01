/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { ReactivityProvider } from '/client/imports/facades';
import { Mongo } from 'meteor/mongo';
import { Connections, Dumps, QueryHistory, SchemaAnalyzeResult, Settings, ShellCommands } from '/lib/imports/collections';

describe('ReactivityProvider', () => {
  it('there should be 6 types', () => {
    // prepare
    // execute
    // verify
    expect(ReactivityProvider.types).to.eql({ Connections, Dumps, QueryHistory, SchemaAnalyzeResult, Settings, ShellCommands });
  });

  describe('findOne tests', () => {
    const result = { test: 123 };
    beforeEach(() => {
      sinon.stub(Mongo.Collection.prototype, 'findOne').returns(result);
    });

    afterEach(() => {
      Mongo.Collection.prototype.findOne.restore();
    });

    it('findOne with invalid type', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.findOne.callCount).to.equal(0);
      expect(() => { ReactivityProvider.findOne('invalidType', {}); }).to.throw();
    });

    it('findOne with invalid query', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.findOne.callCount).to.equal(0);
      expect(() => { ReactivityProvider.findOne(ReactivityProvider.types.Settings, 'invalid'); }).to.throw();
    });

    it('findOne with valid call', () => {
      // prepare

      // execute
      const internalResult = ReactivityProvider.findOne(ReactivityProvider.types.Settings, {});

      // verify
      expect(Mongo.Collection.prototype.findOne.callCount).to.equal(1);
      expect(internalResult).to.eql(result);
    });
  });

  describe('find tests', () => {
    let stub;
    const result = [{ test: 1 }, { test2: 2 }];

    beforeEach(() => {
      stub = { fetch: sinon.stub().returns(result) };
      sinon.stub(Mongo.Collection.prototype, 'find').returns(stub);
    });

    afterEach(() => {
      Mongo.Collection.prototype.find.restore();
    });

    it('find with invalid type', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.find('invalidType', {}); }).to.throw();
    });

    it('find with invalid query', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.find(ReactivityProvider.types.Settings, 'invalid'); }).to.throw();
    });

    it('find with invalid options', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.find(ReactivityProvider.types.Settings, {}, 'invalid'); }).to.throw();
    });

    it('find with valid call', () => {
      // prepare

      // execute
      const internalResult = ReactivityProvider.find(ReactivityProvider.types.Connections, {});

      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(1);
      expect(stub.fetch.callCount).to.equal(1);
      expect(internalResult).to.eql(result);
    });

    it('find with valid call (1)', () => {
      // prepare

      // execute
      const internalResult = ReactivityProvider.find(ReactivityProvider.types.Settings, {}, { test: 123 });

      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(1);
      expect(stub.fetch.callCount).to.equal(1);
      expect(internalResult).to.eql(result);
    });
  });

  describe('observeChanges tests', () => {
    let stub;

    beforeEach(() => {
      stub = { observeChanges: sinon.stub() };
      sinon.stub(Mongo.Collection.prototype, 'find').returns(stub);
    });

    afterEach(() => {
      Mongo.Collection.prototype.find.restore();
    });

    it('observeChanges with invalid type', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.observeChanges('invalidType', {}); }).to.throw();
    });

    it('observeChanges with invalid query', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.observeChanges(ReactivityProvider.types.Settings, 'invalid'); }).to.throw();
    });

    it('observeChanges with invalid options', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.observeChanges(ReactivityProvider.types.SchemaAnalyzeResult, {}, 'invalid'); }).to.throw();
    });

    it('observeChanges with invalid callbacks', () => {
      // prepare
      // execute
      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(0);
      expect(() => { ReactivityProvider.observeChanges(ReactivityProvider.types.Settings, {}, {}, 'învalid'); }).to.throw();
    });

    it('observeChanges with valid call', () => {
      // prepare

      // execute
      ReactivityProvider.observeChanges(ReactivityProvider.types.Settings, {});

      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(1);
      expect(stub.observeChanges.callCount).to.equal(1);
    });

    it('observeChanges with valid call (1)', () => {
      // prepare

      // execute
      ReactivityProvider.observeChanges(ReactivityProvider.types.SchemaAnalyzeResult, {}, { test: 123 });

      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(1);
      expect(stub.observeChanges.callCount).to.equal(1);
    });

    it('observeChanges with valid call (2)', () => {
      // prepare

      // execute
      ReactivityProvider.observeChanges(ReactivityProvider.types.Connections, {}, { test: 123 }, { added: 123 });

      // verify
      expect(Mongo.Collection.prototype.find.callCount).to.equal(1);
      expect(stub.observeChanges.callCount).to.equal(1);
    });
  });
});
