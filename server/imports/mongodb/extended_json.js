/**
 * Created by Sercan on 29.10.2016.
 */
// a simple fork of https://github.com/mongodb/js-bson/blob/0.5/extended-json/index.js

"use strict";

var bson = require('bson');
var Binary = bson.Binary
    , Long = bson.Long
    , MaxKey = bson.MaxKey
    , MinKey = bson.MinKey
    , BSONRegExp = bson.BSONRegExp
    , Timestamp = bson.Timestamp
    , ObjectId = bson.ObjectId
    , Code = bson.Code
    , Decimal128 = bson.Decimal128;

export const serialize = function (document) {
    if (document && typeof document == 'object') {
        var keys = Object.keys(document);
        if (keys.length == 0) return {};

        // for(var name in document) {
        for (let i = 0; i < keys.length; i++) {
            var name = keys[i];

            if (Array.isArray(document[name])) {
                for (let i = 0; i < document[name].length; i++) {
                    serialize(document[name][i]);
                }
            } else if (document[name] && typeof document[name] == 'object') {
                if (document[name] instanceof Binary || document[name]._bsontype == 'Binary') {
                    document[name] = {
                        '$binary': document[name].buffer.toString('base64'),
                        '$type': new Buffer([document[name].sub_type]).toString('hex')
                    };
                } else if (document[name] instanceof Code || document[name]._bsontype == 'Code') {
                    document[name] = {'$code': document[name].code};
                    if (document[name].scope) document[name]['$scope'] = document[name].scope;
                } else if (document[name] instanceof Date) {
                    document[name] = {'$date': document[name].toISOString()};
                } else if (document[name] instanceof Long || document[name]._bsontype == 'Long') {
                    document[name] = {'$numberLong': document[name].toString()};
                } else if (document[name] instanceof MaxKey || document[name]._bsontype == 'MaxKey') {
                    document[name] = {'$maxKey': true};
                } else if (document[name] instanceof MinKey || document[name]._bsontype == 'MinKey') {
                    document[name] = {'$minKey': true};
                } else if (document[name] instanceof ObjectId || document[name]._bsontype == 'ObjectID') {
                    document[name] = {'$oid': document[name].toString()};
                } else if (document[name] instanceof BSONRegExp) {
                    document[name] = {'$regex': document[name].pattern, '$options': document[name].options};
                } else if (document[name] instanceof Timestamp || document[name]._bsontype == 'Timestamp') {
                    document[name] = {'$timestamp': {t: document[name].high_, i: document[name].low_}};
                } else if (document[name] instanceof Decimal128 || document[name]._bsontype == 'Decimal128') {
                    document[name] = {'$numberDecimal': document[name].toString()};
                } else if (document[name] === undefined) {
                    document[name] = {'$undefined': true};
                } else {
                    serialize(document[name]);
                }
            }
        }
    }
    else if (document && Object.prototype.toString.call(document) === '[object Array]') {
        for (let i = 0; i < document.length; i++) {
            serialize(document[i]);
        }
    }
};

export const deserialize = function (document) {
    if (document && typeof document == 'object') {
        for (let name in document) {
            if (document.hasOwnProperty(name) && document[name] && Array.isArray(document[name])) {
                for (var i = 0; i < document[name].length; i++) {
                    deserialize(document[name][i]);
                }
            } else if (document.hasOwnProperty(name) && document[name] && typeof document[name] == 'object') {
                if (document[name]['$binary'] != undefined) {
                    var buffer = new Buffer(document[name]['$binary'], 'base64');
                    var type = new Buffer(document[name]['$type'], 'hex')[0];
                    document[name] = new Binary(buffer, type);
                } else if (document[name]['$code'] != undefined) {
                    var code = document[name]['$code'];
                    var scope = document[name]['$scope'];
                    document[name] = new Code(code, scope);
                } else if (document[name]['$date'] != undefined) {
                    if (typeof document[name]['$date'] == 'string') {
                        document[name] = new Date(document[name]['$date']);
                    } else if (typeof document[name]['$date'] == 'object'
                        && document[name]['$date']['$numberLong']) {
                        var time = parseInt(document[name]['$date']['$numberLong'], 10);
                        var date = new Date();
                        date.setTime(time);
                        document[name] = date;
                    }
                } else if (document[name]['$numberLong'] != undefined) {
                    document[name] = Long.fromString(document[name]['$numberLong']);
                } else if (document[name]['$maxKey'] != undefined) {
                    document[name] = new MaxKey();
                } else if (document[name]['$minKey'] != undefined) {
                    document[name] = new MinKey();
                } else if (document[name]['$oid'] != undefined) {
                    document[name] = new ObjectId(new Buffer(document[name]['$oid'], 'hex'));
                } else if (document[name]['$regex'] != undefined) {
                    document[name] = new BSONRegExp(document[name]['$regex'], document[name]['$options'])
                } else if (document[name]['$timestamp'] != undefined) {
                    document[name] = new Timestamp(document[name]['$timestamp'].i, document[name]['$timestamp'].t);
                } else if (document[name]['$numberDecimal'] != undefined) {
                    document[name] = new Decimal128.fromString(document[name]['$numberDecimal']);
                } else if (document[name]['$undefined'] != undefined) {
                    document[name] = undefined;
                } else {
                    deserialize(document[name]);
                }
            }
        }
    }
    else if (document && Object.prototype.toString.call(document) === '[object Array]') {
        for (let i = 0; i < document.length; i++) {
            deserialize(document[i]);
        }
    }
};
