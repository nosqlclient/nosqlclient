/**
 * Created by RSercan on 27.12.2015.
 */
import LOGGER from "../internal/logging/logger";
import Helper from "./helper";

Meteor.methods({
    bulkWrite(selectedCollection, operations, convertIds, convertDates) {
        const methodArray = [
            {
                "bulkWrite": [operations]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    updateOne(selectedCollection, selector, setObject, options, convertIds, convertDates) {
        const methodArray = [
            {
                "updateOne": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    updateMany(selectedCollection, selector, setObject, options, convertIds, convertDates) {
        const methodArray = [
            {
                "updateMany": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    stats(selectedCollection, options) {
        const methodArray = [
            {
                "stats": [options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    rename(selectedCollection, newName, options) {
        const methodArray = [
            {
                "rename": [newName, options]
            }
        ];

        let result = proceedQueryExecution(selectedCollection, methodArray);
        Helper.removeCollectionTopology(result);
        console.log(result);
        return result;
    },

    reIndex(selectedCollection) {
        const methodArray = [
            {
                "reIndex": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    options(selectedCollection) {
        const methodArray = [
            {
                "options": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    mapReduce(selectedCollection, map, reduce, options) {
        return proceedMapReduceExecution(selectedCollection, map, reduce, options);
    },

    isCapped(selectedCollection) {
        const methodArray = [
            {
                "isCapped": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    insertMany(selectedCollection, docs, convertIds, convertDates) {
        const methodArray = [
            {
                "insertMany": [docs]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    indexInformation(selectedCollection, isFull) {
        const methodArray = [
            {
                "indexInformation": [{'full': isFull}]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    geoNear(selectedCollection, xAxis, yAxis, options) {
        const methodArray = [
            {
                "geoNear": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    geoHaystackSearch(selectedCollection, xAxis, yAxis, options) {
        const methodArray = [
            {
                "geoHaystackSearch": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray);
    },

    dropIndex(selectedCollection, indexName) {
        const methodArray = [
            {
                "dropIndex": [indexName]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray);
    },

    distinct(selectedCollection, selector, fieldName, convertIds, convertDates) {
        const methodArray = [
            {
                "distinct": [fieldName, selector]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    delete(selectedCollection, selector, convertIds, convertDates) {
        const methodArray = [
            {
                "deleteMany": [selector]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    createIndex(selectedCollection, fields, options) {
        const methodArray = [
            {
                "createIndex": [fields, options]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray);
    },

    findOne(selectedCollection, selector, cursorOptions, convertIds, convertDates) {
        const methodArray = [
            {
                "find": [selector]
            }
        ];
        for (let key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                let obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }
        methodArray.push({'limit': [1]});
        methodArray.push({'next': []});
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    find(selectedCollection, selector, cursorOptions, executeExplain, convertIds, convertDates) {
        const methodArray = [
            {
                "find": [selector]
            }
        ];
        for (let key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                let obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }

        if (executeExplain) {
            methodArray.push({'explain': []});
        } else {
            methodArray.push({'toArray': []});
        }

        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    findOneAndUpdate(selectedCollection, selector, setObject, options, convertIds, convertDates) {
        const methodArray = [
            {
                "findOneAndUpdate": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    findOneAndReplace(selectedCollection, selector, setObject, options, convertIds, convertDates) {
        const methodArray = [
            {
                "findOneAndReplace": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    findOneAndDelete(selectedCollection, selector, options, convertIds, convertIsoDates) {
        const methodArray = [
            {
                "findOneAndDelete": [selector, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertIsoDates);
    },

    aggregate(selectedCollection, pipeline, convertIds, convertDates) {
        const methodArray = [
            {
                "aggregate": [pipeline]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    },

    count(selectedCollection, selector, convertIds, convertDates) {
        const methodArray = [
            {
                "count": [selector]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, convertIds, convertDates);
    }
});

const proceedMapReduceExecution = function (selectedCollection, map, reduce, options) {
    Helper.convertJSONtoBSON(options);

    LOGGER.info('[mapReduce]', selectedCollection, map, reduce, options);

    let result = Async.runSync(function (done) {
        try {
            const collection = database.collection(selectedCollection);
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

    Helper.convertBSONtoJSON(result);
    return result;
};

const proceedQueryExecution = function (selectedCollection, methodArray, convertIds, convertDates) {
    let convertObjectId = true;
    let convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

    LOGGER.info(methodArray, 'convertIds: ' + convertObjectId, 'convertDates: ' + convertIsoDates, selectedCollection);

    let result = Async.runSync(function (done) {
        try {
            let execution = database.collection(selectedCollection);
            for (let i = 0; i < methodArray.length; i++) {
                let last = i == (methodArray.length - 1);
                let entry = methodArray[i];
                Helper.convertJSONtoBSON(entry, convertObjectId, convertIsoDates);

                for (let key in entry) {
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

    Helper.convertBSONtoJSON(result);
    Helper.removeConnectionTopology(result);
    return result;
};