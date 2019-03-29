/* eslint-env mocha */

import { Enums } from '/client/imports/modules';
import { expect } from 'chai';

describe('Enums', () => {
  it('QUERY_TYPES should have 27 queries', () => {
    // prepare

    // execute
    const result = Enums.QUERY_TYPES;

    // verify
    expect(Object.keys(result).length).to.equal(26);
  });

  it('ADMIN_QUERY_TYPES should have 10 queries', () => {
    // prepare

    // execute
    const result = Enums.ADMIN_QUERY_TYPES;

    // verify
    expect(Object.keys(result).length).to.equal(10);
  });

  it('COMMAND_OPTIONS should have 1 option', () => {
    // prepare

    // execute
    const result = Enums.COMMAND_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(1);
  });

  it('PROFILING_LEVELS should have 3 options', () => {
    // prepare

    // execute
    const result = Enums.PROFILING_LEVELS;

    // verify
    expect(Object.keys(result).length).to.equal(3);
  });

  it('ADD_USER_OPTIONS should have 2 options', () => {
    // prepare

    // execute
    const result = Enums.ADD_USER_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(2);
  });

  it('ADD_COLLECTION_OPTIONS should have 3 options', () => {
    // prepare

    // execute
    const result = Enums.ADD_COLLECTION_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(3);
  });

  it('COUNT_OPTIONS should have 4 options', () => {
    // prepare

    // execute
    const result = Enums.COUNT_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(4);
  });

  it('BULK_WRITE_OPTIONS should have 2 options', () => {
    // prepare

    // execute
    const result = Enums.BULK_WRITE_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(2);
  });

  it('AGGREGATE_OPTIONS should have 7 options', () => {
    // prepare

    // execute
    const result = Enums.AGGREGATE_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(7);
  });

  it('UPDATE_OPTIONS should have 2 options', () => {
    // prepare

    // execute
    const result = Enums.UPDATE_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(2);
  });

  it('STATS_OPTIONS should have 1 option', () => {
    // prepare

    // execute
    const result = Enums.STATS_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(1);
  });

  it('RENAME_OPTIONS should have 1 option', () => {
    // prepare

    // execute
    const result = Enums.RENAME_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(1);
  });

  it('MAP_REDUCE_OPTIONS should have 10 options', () => {
    // prepare

    // execute
    const result = Enums.MAP_REDUCE_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(10);
  });

  it('GEO_HAYSTACK_SEARCH_OPTIONS should have 3 options', () => {
    // prepare

    // execute
    const result = Enums.GEO_HAYSTACK_SEARCH_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(3);
  });

  it('CREATE_INDEX_OPTIONS should have 9 options', () => {
    // prepare

    // execute
    const result = Enums.CREATE_INDEX_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(9);
  });

  it('CURSOR_OPTIONS should have 8 options', () => {
    // prepare

    // execute
    const result = Enums.CURSOR_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(8);
  });

  it('INSERT_MANY_OPTIONS should have 2 options', () => {
    // prepare

    // execute
    const result = Enums.INSERT_MANY_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(2);
  });

  it('DISTINCT_OPTIONS should have 1 option', () => {
    // prepare

    // execute
    const result = Enums.DISTINCT_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(1);
  });

  it('FINDONE_MODIFY_OPTIONS should have 6 options', () => {
    // prepare

    // execute
    const result = Enums.FINDONE_MODIFY_OPTIONS;

    // verify
    expect(Object.keys(result).length).to.equal(6);
  });
});
