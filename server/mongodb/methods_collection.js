/**
 * Created by RSercan on 27.12.2015.
 */
Meteor.methods({
    'bulkWrite': function (selectedCollection, operations, convertIds, convertDates) {
        var methodArray = [
            {
                "bulkWrite": [operations]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'updateOne': function (selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "updateOne": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'updateMany': function (selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "updateMany": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'stats': function (selectedCollection, options) {
        var methodArray = [
            {
                "stats": [options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'rename': function (selectedCollection, newName, options) {
        var methodArray = [
            {
                "rename": [newName, options]
            }
        ];

        var result = proceedQueryExecution(selectedCollection, methodArray);
        removeCollectionTopology(result);
        console.log(result);
        return result;
    },

    'reIndex': function (selectedCollection) {
        var methodArray = [
            {
                "reIndex": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'options': function (selectedCollection) {
        var methodArray = [
            {
                "options": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'mapReduce': function (selectedCollection, map, reduce, options) {
        return proceedMapReduceExecution(selectedCollection, map, reduce, options);
    },

    'isCapped': function (selectedCollection) {
        var methodArray = [
            {
                "isCapped": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'insertMany': function (selectedCollection, docs, convertIds, convertDates) {
        var methodArray = [
            {
                "insertMany": [docs]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'indexInformation': function (selectedCollection, isFull) {
        var methodArray = [
            {
                "indexInformation": [{'full': isFull}]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'geoNear': function (selectedCollection, xAxis, yAxis, options) {
        var methodArray = [
            {
                "geoNear": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'geoHaystackSearch': function (selectedCollection, xAxis, yAxis, options) {
        var methodArray = [
            {
                "geoHaystackSearch": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'dropIndex': function (selectedCollection, indexName) {
        var methodArray = [
            {
                "dropIndex": [indexName]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'distinct': function (selectedCollection, selector, fieldName, convertIds, convertDates) {
        var methodArray = [
            {
                "distinct": [fieldName, selector]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'delete': function (selectedCollection, selector, convertIds, convertDates) {
        var methodArray = [
            {
                "deleteMany": [selector]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'createIndex': function (selectedCollection, fields, options) {
        var methodArray = [
            {
                "createIndex": [fields, options]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray);
    },

    'findOne': function (selectedCollection, selector, cursorOptions, convertIds, convertDates) {
        var methodArray = [
            {
                "find": [selector]
            }
        ];
        for (var key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                var obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }
        methodArray.push({'limit': [1]});
        methodArray.push({'next': []});
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'find': function (selectedCollection, selector, cursorOptions, executeExplain, convertIds, convertDates) {
        var methodArray = [
            {
                "find": [selector]
            }
        ];
        for (var key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                var obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }

        if(executeExplain){
            methodArray.push({'explain': []});
        }else{
            methodArray.push({'toArray': []});
        }

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndUpdate': function (selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "findOneAndUpdate": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndReplace': function (selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "findOneAndReplace": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndDelete': function (selectedCollection, selector, options, convertIds, convertIsoDates) {
        var methodArray = [
            {
                "findOneAndDelete": [selector, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertIsoDates);
    },

    'aggregate': function (selectedCollection, pipeline, convertIds, convertDates) {
        var methodArray = [
            {
                "aggregate": [pipeline]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    'count': function (selectedCollection, selector, convertIds, convertDates) {
        var methodArray = [
            {
                "count": [selector]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    }
});

var proceedMapReduceExecution = function (selectedCollection, map, reduce, options) {
    convertJSONtoBSON(options);

    LOGGER.info('[mapReduce]', selectedCollection, map, reduce, options);

    var result = Async.runSync(function (done) {
        try {
            var collection = database.collection(selectedCollection);
            collection.mapReduce(map, reduce, options, function (err, resultCollection) {
                if (err) {
                    done(err, null);
                    return;
                }
                if ((typeof options.out) == 'string') {
                    resultCollection.find().toArray(function (err, result) {
                        done(err, result);
                    });
                }
                else {
                    done(err, resultCollection);
                }
            });
        }
        catch (ex) {
            LOGGER.error('[mapReduce]', ex);
            done(new Meteor.Error(ex.message), null);
        }
    });

    convertBSONtoJSON(result);
    return result;
};

var proceedQueryExecution = function (selectedCollection, methodArray, convertIds, convertDates) {
    var convertObjectId = true;
    var convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

    LOGGER.info(methodArray, 'convertIds: ' + convertObjectId, 'convertDates: ' + convertIsoDates, selectedCollection);

    var result = Async.runSync(function (done) {
        try {
            var execution = database.collection(selectedCollection);
            for (var i = 0; i < methodArray.length; i++) {
                var last = i == (methodArray.length - 1);
                var entry = methodArray[i];
                convertJSONtoBSON(entry, convertObjectId, convertIsoDates);

                for (var key in entry) {
                    if (entry.hasOwnProperty(key)) {
                        if (last && key == Object.keys(entry)[Object.keys(entry).length - 1]) {
                            entry[key].push(function (err, docs) {
                                done(err, docs);
                            });
                            execution[key].apply(execution, entry[key]);
                        }
                        else {
                            execution = execution[key].apply(execution, entry[key]);
                        }
                    }
                }
            }
        }
        catch (ex) {
            LOGGER.error(methodArray, ex);
            done(new Meteor.Error(ex.message), null);
        }
    });

    convertBSONtoJSON(result);
    removeConnectionTopology(result);
    return result;
};