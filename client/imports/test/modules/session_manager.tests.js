/* eslint-env mocha */

import { SessionManager } from '/client/imports/modules';
import { ReactiveDict } from 'meteor/reactive-dict';
import { expect } from 'meteor/practicalmeteor:chai';

describe('SessionManager', () => {
  afterEach(() => {
    Object.keys(SessionManager.dictionary.keys).forEach((key) => {
      SessionManager.dictionary.delete(key);
    });
  });

  describe('dictionary tests', () => {
    it('dictionary is reactive source', () => {
      // verify
      expect(SessionManager.dictionary).to.be.an.instanceof(ReactiveDict);
    });
  });

  describe('set tests', () => {
    it('key valid & not exists', () => {
      // prepare

      // execute
      SessionManager.set('testing', true);

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'true');
    });

    it('key valid & already exists', () => {
      // prepare

      // execute
      SessionManager.set('testing', true);
      SessionManager.set('testing', false);

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'false');
    });

    it('key invalid', () => {
      // prepare

      // execute
      SessionManager.set('', true);
      SessionManager.set(undefined, '123');
      SessionManager.set(null, 123);

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(0);
    });

    it('key valid value null', () => {
      // prepare

      // execute
      SessionManager.set('testing', null);

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'null');
    });

    it('key valid value undefined', () => {
      // prepare

      // execute
      SessionManager.set('testing', undefined);

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', undefined);
    });
  });

  describe('get tests', () => {
    it('key valid & not exists', () => {
      // prepare

      // execute
      const result = SessionManager.get('testing');

      // verify
      expect(result).to.be.equal(undefined);
    });

    it('key valid & already exists', () => {
      // prepare
      SessionManager.dictionary.set('testing', true);

      // execute
      const result = SessionManager.get('testing');

      // verify
      expect(result).to.equal(true);
    });

    it('key invalid', () => {
      // prepare
      SessionManager.dictionary.set('', 'something');

      // execute
      const result = SessionManager.get('');

      // verify
      expect(result).to.equal(undefined);
    });

    it('key valid & value null', () => {
      // prepare
      SessionManager.dictionary.set('testing', null);

      // execute
      const result = SessionManager.get('testing');

      // verify
      expect(result).to.equal(null);
    });

    it('key valid & value undefined', () => {
      // prepare
      SessionManager.dictionary.set('testing', undefined);

      // execute
      const result = SessionManager.get('testing');

      // verify
      expect(result).to.equal(undefined);
    });

    it('key valid & value different types', () => {
      // prepare
      SessionManager.dictionary.set('number', 123);
      SessionManager.dictionary.set('string', '123');
      SessionManager.dictionary.set('boolean', true);
      SessionManager.dictionary.set('object', { test: 123, test2: [1, 2, 3] });
      SessionManager.dictionary.set('array', [1, 2, 3]);

      // execute
      const numberVar = SessionManager.get('number');
      const stringVar = SessionManager.get('string');
      const booleanVar = SessionManager.get('boolean');
      const objectVar = SessionManager.get('object');
      const arrayVar = SessionManager.get('array');

      // verify
      expect(numberVar).to.equal(123);
      expect(stringVar).to.equal('123');
      expect(booleanVar).to.equal(true);
      expect(objectVar).to.eql({ test: 123, test2: [1, 2, 3] });
      expect(arrayVar).to.eql([1, 2, 3]);
    });
  });

  describe('remove tests', () => {
    it('key valid & not exists', () => {
      // prepare

      // execute
      SessionManager.remove('testing');

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'null');
    });

    it('key valid & already exists', () => {
      // prepare
      SessionManager.dictionary.set('testing', true);
      SessionManager.dictionary.set('testing2', 123);

      // execute
      SessionManager.remove('testing');

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(2);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'null');
      expect(SessionManager.dictionary.keys).to.have.property('testing2', '123');
    });

    it('key invalid', () => {
      // prepare
      SessionManager.dictionary.set('', 'something');

      // execute
      SessionManager.remove('');

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('', '"something"'); // since noone can set it, noone can remove it too.
    });

    it('key valid & value null', () => {
      // prepare
      SessionManager.dictionary.set('testing', null);

      // execute
      SessionManager.remove('testing');

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'null');
    });

    it('key valid & value undefined', () => {
      // prepare
      SessionManager.dictionary.set('testing', undefined);

      // execute
      SessionManager.remove('testing');

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(1);
      expect(SessionManager.dictionary.keys).to.have.property('testing', 'null');
    });
  });

  describe('clear tests', () => {
    it('no keys', () => {
      // prepare

      // execute
      SessionManager.clear();

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(0);
    });

    it('multiple keys exist', () => {
      // prepare
      SessionManager.dictionary.set('testing', true);
      SessionManager.dictionary.set('testing2', 123);

      // execute
      SessionManager.clear();

      // verify
      expect(Object.keys(SessionManager.dictionary.keys).length).to.equal(0);
    });
  });
});
