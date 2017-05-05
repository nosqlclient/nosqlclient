/**
 * Created by RSercan on 27.12.2015.
 */
/*global Async*/
import LOGGER from "../internal/logger";
import Helper from "./helper";
import {Meteor} from "meteor/meteor";
import {databasesBySessionId} from "./methods_common";


const proceedMapReduceExecution = function (selectedCollection, map, reduce, options, sessionId) {
    options = Helper.convertJSONtoBSON(options);

    LOGGER.info('[mapReduce]', selectedCollection, map, reduce, options);

    let result = Async.runSync(function (done) {
        try {
            const collection = databasesBySessionId[sessionId].collection(selectedCollection);
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

    return Helper.convertBSONtoJSON(result);
};

export const proceedQueryExecution = function (selectedCollection, methodArray, sessionId, removeCollectionTopology) {
    LOGGER.info(JSON.stringify(methodArray), selectedCollection);

    let result = Async.runSync(function (done) {
        try {
            let execution = databasesBySessionId[sessionId].collection(selectedCollection);
            for (let i = 0; i < methodArray.length; i++) {
                let last = i == (methodArray.length - 1);
                let entry = methodArray[i];
                entry = Helper.convertJSONtoBSON(entry);
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

    if (removeCollectionTopology) {
        Helper.removeCollectionTopology(result);
    }
    Helper.removeConnectionTopology(result);
    return Helper.convertBSONtoJSON(result);
};

Meteor.methods({
    saveFindResult(selectedCollection, updateObjects, deleteObjectIds, addedObjects, sessionId){
        for (let obj of updateObjects) {
            proceedQueryExecution(selectedCollection, [{"updateOne": [{_id: obj._id}, obj, {}]}], sessionId);
        }

        if (deleteObjectIds.length > 0) {
            proceedQueryExecution(selectedCollection, [{"deleteMany": [{_id: {$in: deleteObjectIds}}]}], sessionId);
        }

        if (addedObjects.length > 0) {
            proceedQueryExecution(selectedCollection, [{"insertMany": [addedObjects]}], sessionId);
        }
    },

    bulkWrite(selectedCollection, operations, options, sessionId) {
        const methodArray = [
            {
                "bulkWrite": [operations, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    updateOne(selectedCollection, selector, setObject, options, sessionId) {
        const methodArray = [
            {
                "updateOne": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    updateMany(selectedCollection, selector, setObject, options, sessionId) {
        const methodArray = [
            {
                "updateMany": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    stats(selectedCollection, options, sessionId) {
        const methodArray = [
            {
                "stats": [options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    rename(selectedCollection, newName, options, sessionId) {
        const methodArray = [
            {
                "rename": [newName, options]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId, true);
    },

    reIndex(selectedCollection, sessionId) {
        const methodArray = [
            {
                "reIndex": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    options(selectedCollection, sessionId) {
        const methodArray = [
            {
                "options": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    mapReduce(selectedCollection, map, reduce, options, sessionId) {
        return proceedMapReduceExecution(selectedCollection, map, reduce, options, sessionId);
    },

    isCapped(selectedCollection, sessionId) {
        const methodArray = [
            {
                "isCapped": []
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    insertMany(selectedCollection, docs, options, sessionId) {
        const methodArray = [
            {
                "insertMany": [docs, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    indexInformation(selectedCollection, isFull, sessionId) {
        const methodArray = [
            {
                "indexInformation": [{'full': isFull}]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    geoNear(selectedCollection, xAxis, yAxis, options, sessionId) {
        const methodArray = [
            {
                "geoNear": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    geoHaystackSearch(selectedCollection, xAxis, yAxis, options, sessionId) {
        const methodArray = [
            {
                "geoHaystackSearch": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    dropIndex(selectedCollection, indexName, sessionId) {
        const methodArray = [
            {
                "dropIndex": [indexName]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    distinct(selectedCollection, selector, fieldName, options, sessionId) {
        const methodArray = [
            {
                "distinct": [fieldName, selector, options]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    delete(selectedCollection, selector, sessionId) {
        const methodArray = [
            {
                "deleteMany": [selector]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    createIndex(selectedCollection, fields, options, sessionId) {
        const methodArray = [
            {
                "createIndex": [fields, options]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    findOne(selectedCollection, selector, cursorOptions, sessionId) {
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
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    find(selectedCollection, selector, cursorOptions, executeExplain, sessionId) {
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

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    findOneAndUpdate(selectedCollection, selector, setObject, options, sessionId) {
        const methodArray = [
            {
                "findOneAndUpdate": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    findOneAndReplace(selectedCollection, selector, setObject, options, sessionId) {
        const methodArray = [
            {
                "findOneAndReplace": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    findOneAndDelete(selectedCollection, selector, options, sessionId) {
        const methodArray = [
            {
                "findOneAndDelete": [selector, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    aggregate(selectedCollection, pipeline, options = {}, sessionId) {
        const methodArray = [
            {
                "aggregate": [pipeline, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    count(selectedCollection, selector, options, sessionId) {
        const methodArray = [
            {
                "count": [selector, options]
            }
        ];
        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    },

    group (selectedCollection, keys, condition, initial, reduce, finalize, command, sessionId){
        const methodArray = [
            {
                "group": [keys, condition, initial, reduce, finalize, command]
            }
        ];

        return proceedQueryExecution(selectedCollection, methodArray, sessionId);
    }
});