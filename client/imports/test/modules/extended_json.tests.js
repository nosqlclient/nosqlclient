/* eslint-env mocha */

import { ExtendedJSON } from '/client/imports/modules';
import { expect } from 'chai';

describe('ExtendedJSON', () => {
  describe('regex only tests', () => {
    it('simple regex without $regex & $options', () => {
      // prepare
      const str = '{a: true, b: 123, c: /^/d/}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: '^/d', $options: '' } });
    });

    it('complex regex without $regex & $options', () => {
      // prepare
      const str = '{a:true,b:123,c:{$regex:/^s^/d.*?.?/\\\\)\\\\(()/gi}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: '^s^/d.*?.?/\\)\\(()', $options: 'gi' } });
    });

    it('simple regex without $regex with options', () => {
      // prepare
      const str = '{a: true, b: 123, c: /^/d/xmi}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: '^/d', $options: 'xmi' } });
    });

    it('simple regex with $regex without string & $options', () => {
      // prepare
      const str = '{a: true, b: 123, c: {$regex:/asd^!,=}/, $options: "xmi"}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: 'asd^!,=}', $options: 'xmi' } });
    });

    it('simple regex with $regex with string without $options', () => {
      // prepare
      const str = '{a: true, b: 123, c: {$regex:"asd^!,=}"}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: 'asd^!,=}' } });
    });

    it('simple regex with $regex with string with $options', () => {
      // prepare
      const str = '{a: true, b: 123, c: {$regex:"asd^!,=}", $options: "xmi"}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: 'asd^!,=}', $options: 'xmi' } });
    });

    it('simple regex with $regex with options & $options', () => {
      // prepare
      const str = '{a: true, b: 123, c: {$regex:/asd^!,=}/xm, $options: "xmi"}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 123, c: { $regex: 'asd^!,=}', $options: 'xmi' } });
    });

    it('nested regex values with special charachters', () => {
    // prepare
      const str = '{a:/^,^/,b:true,c:"sercan",d:123,e:/^//,f:{$regex:"asd"},g:/as/d/gi,h:"/ sad /",i:/asd/ig,"j":/^^!.?/,   "k":{$regex:/^asdas?!/i,$options:"gim"},'
      + '"l":{$regex:/xtcaq2^=!/mi},  "m" :[{"n":{"$regex":/^!??!/xim,"$options":"x"}}]}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({
        a: { $regex: '^,^', $options: '' },
        b: true,
        c: 'sercan',
        d: 123,
        e: { $regex: '^/', $options: '' },
        f: { $regex: 'asd' },
        g: { $regex: 'as/d', $options: 'gi' },
        h: '/ sad /',
        i: { $regex: 'asd', $options: 'ig' },
        j: { $regex: '^^!.?', $options: '' },
        k: { $regex: '^asdas?!', $options: 'gim' },
        l: { $regex: 'xtcaq2^=!', $options: 'mi' },
        m: [{ n: { $regex: '^!??!', $options: 'x' } }]
      });
    });
  });

  describe('date only tests', () => {
    it('date with isodate without new keyword', () => {
      // prepare
      const str = '{a: true, b: IsoDate("2012-12-19T06:01:17.171Z"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: 'abc' });
    });

    it('date with isodate with new keyword', () => {
      // prepare
      const str = '{a: true, b: new isodate ("2012-12-19T06:01:17.171Z"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: 'abc' });
    });

    it('date with isodate with wrong date', () => {
      // prepare
      const str = '{a: true, b: new isoDate ("asd"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: 'asd' }, c: 'abc' });
    });

    it('date with date without new keyword', () => {
      // prepare
      const str = '{a: true, b: DatE ("2012-12-19T06:01:17.171Z"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: 'abc' });
    });

    it('date with date with new keyword', () => {
      // prepare
      const str = '{a: true, b: new daTe ("2012-12-19T06:01:17.171Z"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: 'abc' });
    });

    it('date with date & isodate (wrong date) with new keyword', () => {
      // prepare
      const str = '{a: true, b: new DaTE ("2012-12-19T06:01:17.171Z"), c: new ISODate("asd")}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: { $date: 'asd' } });
    });

    it('date with date & isodate (wrong date) with & without new keyword', () => {
      // prepare
      const str = '{a: true, b: new DATE ("2012-12-19T06:01:17.171Z"), c: ISODATE("asd")}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $date: '2012-12-19T06:01:17.171Z' }, c: { $date: 'asd' } });
    });
  });

  describe('object id only tests', () => {
    it('simple objectid', () => {
      // prepare
      const str = '{a: true, b: objectid("5c7640bc8c4d42eef699390a"), c: "abc"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $oid: '5c7640bc8c4d42eef699390a' }, c: 'abc' });
    });

    it('multiple objectids', () => {
      // prepare
      const str = '{a: true, b: objectid("5c7640bc8c4d42eef699390a"), c: ObJecTID ("5c7640ee8c4d42eef699390b")}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $oid: '5c7640bc8c4d42eef699390a' }, c: { $oid: '5c7640ee8c4d42eef699390b' } });
    });

    it('wrong objectid', () => {
      // prepare
      const str = '{a: true, b: objectid("213d"), c: ObJecTID ("ccc")}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, c: { $oid: 'ccc' }, b: { $oid: '213d' } });
    });
  });

  describe('multiple shell types tests', () => {
    it('objectid & date', () => {
      // prepare
      const str = '{a: true, b: objectid("5c7640bc8c4d42eef699390a"), c: new isoDate("asd")}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: { $oid: '5c7640bc8c4d42eef699390a' }, c: { $date: 'asd' } });
    });

    it('objectid & date & regex', () => {
      // prepare
      const str = '{a: true, b: objectid("5c7640bc8c4d42eef699390a"), c: new isoDate("asd"), d:/^,,}]^#%\\/^,\\/d\\/\\/\\/,/xm }';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({
        a: true,
        b: { $oid: '5c7640bc8c4d42eef699390a' },
        c: { $date: 'asd' },
        d: { $regex: '^,,}]^#%/^,/d///,', $options: 'xm' }
      });
    });

    it('objectid & date & regex (2)', () => {
      // prepare
      const str = '{a: true, b: objectid("5c7640bc8c4d42eef699390a"), c: new isoDate("asd"), d: /^,,}]^#%\\/^,\\/d\\/\\/\\/,/xm, e: {$regex: /asd^,/, $options:  "xms"}}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({
        a: true,
        b: { $oid: '5c7640bc8c4d42eef699390a' },
        c: { $date: 'asd' },
        d: { $regex: '^,,}]^#%/^,/d///,', $options: 'xm' },
        e: { $regex: 'asd^,', $options: 'xms' }
      });
    });
  });

  describe('quotes separation tests with spaces', () => {
    it('double quotes in double quotes', () => {
      // prepare
      const str = '{a: true, b: "\\"testin  g\\""}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: '"testin  g"' });
    });

    it('single quotes in double quotes', () => {
      // prepare
      const str = '{a: true, b: "\'tes      ting\'"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: '\'tes      ting\'' });
    });

    it('one single quote in double quotes', () => {
      // prepare
      const str = '{a: true, b: "\'testi  ng\'"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: '\'testi  ng\'' });
    });

    it('one double quote in double quotes', () => {
      // prepare
      const str = '{a: true, b: "te \\"sting"}';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({ a: true, b: 'te "sting' });
    });
  });

  describe('number tests #494', () => {
    it('number with a small decimal', () => {
      // prepare
      const str = '{a: 0.00000001, b:2, c: true, d: "sercan", e: { f: [1,2,3] } }';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({
        a: 0.00000001,
        b: 2,
        c: true,
        d: 'sercan',
        e: { f: [1, 2, 3] }
      });
    });

    it('number with a small decimal in different format', () => {
      // prepare
      const str = '{a: 1e-8, b:2, c: true, d: "sercan", e: { f: [1,2,1e-9] } }';

      // execute
      const convertedJson = ExtendedJSON.convertAndCheckJSON(str);

      // verify
      expect(convertedJson).to.eql({
        a: 0.00000001,
        b: 2,
        c: true,
        d: 'sercan',
        e: { f: [1, 2, 0.000000001] }
      });
    });
  });
});
