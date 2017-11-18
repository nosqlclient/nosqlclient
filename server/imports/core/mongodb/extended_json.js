const { Binary, Long, MaxKey, MinKey, BSONRegExp, ObjectId, Timestamp, Code, Decimal128 } = require('bson');

const ExtendedJSON = function () {
};

const convertBsonDocumentToJson = function (doc) {
  if (doc instanceof Binary || doc._bsontype === 'Binary') return { $binary: doc.buffer.toString('base64'), $type: Buffer.from([doc.sub_type]).toString('hex') };
  else if (doc instanceof Code || doc._bsontype === 'Code') {
    const res = { $code: doc.code };
    if (doc.scope) res.$scope = doc.scope;
    return res;
  } else if (doc instanceof Date) return { $date: doc.toISOString() };
  else if (doc instanceof Long || doc._bsontype === 'Long') return { $numberLong: doc.toString() };
  else if (doc instanceof MaxKey || doc._bsontype === 'MaxKey') return { $maxKey: true };
  else if (doc instanceof MinKey || doc._bsontype === 'MinKey') return { $minKey: true };
  else if (doc instanceof ObjectId || doc._bsontype === 'ObjectID') return { $oid: doc.toString() };
  else if (doc instanceof BSONRegExp) return { $regex: doc.pattern, $options: doc.options };
  else if (doc instanceof Timestamp || doc._bsontype === 'Timestamp') return { $timestamp: { t: doc.high_, i: doc.low_ } };
  else if (doc instanceof Decimal128 || doc._bsontype === 'Decimal128') return { $numberDecimal: doc.toString() };
  else if (doc === undefined) return { $undefined: true };
};

const convertJsonDocumentToBson = function (doc) {
  if (doc.$binary) return new Binary(Buffer.from(doc.$binary, 'base64'), Buffer.from(doc.$type, 'hex')[0]);
  else if (doc.$code) return new Code(doc.$code, doc.$scope);
  else if (doc.$date) {
    if (typeof doc.$date === 'string') return new Date(doc.$date);
    else if (typeof doc.$date === 'object' && doc.$date.$numberLong) {
      const date = new Date();
      date.setTime(parseInt(doc.$date.$numberLong, 10));
      return date;
    }
  } else if (doc.$numberLong) return Long.fromString(doc.$numberLong);
  else if (doc.$maxKey) return new MaxKey();
  else if (doc.$minKey) return new MinKey();
  else if (doc.$oid) return new ObjectId(Buffer.from(doc.$oid, 'hex'));
  else if (doc.$regex) return new BSONRegExp(doc.$regex, doc.$options || '');
  else if (doc.$timestamp) return new Timestamp(doc.$timestamp.i, doc.$timestamp.t);
  else if (doc.$numberDecimal) return Decimal128.fromString(doc.$numberDecimal);
  else if (doc.$undefined) return undefined;
};

const isBsonDocConvertible = function (param) {
  return param !== null && (typeof param === 'object') &&
  Object.prototype.toString.call(param) !== '[object Array]' && convertBsonDocumentToJson(param);
};

const isJsonDocConvertible = function (param) {
  return param !== null && Object.prototype.toString.call(param) === '[object Object]' && convertJsonDocumentToBson(param);
};

ExtendedJSON.prototype = {
  convertBSONtoJSON(obj) {
    // there are some other objects such as Math, Date etc..
    if (obj && (typeof obj === 'object') && Object.prototype.toString.call(obj) !== '[object Array]' && convertBsonDocumentToJson(obj)) {
      return convertBsonDocumentToJson(obj);
    }

    Object.keys(obj).forEach((property) => {
      if (obj[property]) {
        if ((typeof obj[property] === 'object') && Object.prototype.toString.call(obj[property]) !== '[object Array]') {
          if (convertBsonDocumentToJson(obj[property])) obj[property] = convertBsonDocumentToJson(obj[property]);
          else obj[property] = this.convertBSONtoJSON(obj[property]);
        } else if (Object.prototype.toString.call(obj[property]) === '[object Array]') {
          for (let i = 0; i < obj[property].length; i += 1) {
            if (isBsonDocConvertible(obj[property][i])) obj[property][i] = convertBsonDocumentToJson(obj[property][i]);
            else obj[property][i] = this.convertBSONtoJSON(obj[property][i]);
          }
        }
      }
    });

    return obj;
  },

  convertJSONtoBSON(obj) {
    if (obj && Object.prototype.toString.call(obj) === '[object Object]' && convertJsonDocumentToBson(obj)) {
      return convertJsonDocumentToBson(obj);
    }

    Object.keys(obj).forEach((property) => {
      if (obj[property]) {
        if (Object.prototype.toString.call(obj[property]) === '[object Object]') {
          if (convertJsonDocumentToBson(obj[property])) obj[property] = convertJsonDocumentToBson(obj[property]);
          else obj[property] = this.convertJSONtoBSON(obj[property]);
        } else if (Object.prototype.toString.call(obj[property]) === '[object Array]') {
          for (let i = 0; i < obj[property].length; i += 1) {
            if (isJsonDocConvertible(obj[property][i])) obj[property][i] = convertJsonDocumentToBson(obj[property][i]);
            else obj[property][i] = this.convertJSONtoBSON(obj[property][i]);
          }
        }
      }
    });

    return obj;
  }
};

export default new ExtendedJSON();
