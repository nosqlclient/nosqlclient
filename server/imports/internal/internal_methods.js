/**
 * Created by RSercan on 26.12.2015.
 */
import { Meteor } from 'meteor/meteor';
import { Actions, QueryHistory, SchemaAnalyzeResult } from '/lib/imports/collections';

Meteor.methods({
  removeSchemaAnalyzeResult(sessionId) {
    LOGGER.info('[removeSchemaAnalyzeResult]', sessionId);
    SchemaAnalyzeResult.remove({ sessionId });
  },

  saveActions(action) {
    LOGGER.info('[saveActions]', action);
    Actions.insert(action);
  },

  saveQueryHistory(history) {
    LOGGER.info('[saveQueryHistory]', history);
    const queryHistoryCount = QueryHistory.find({
      connectionId: history.connectionId,
      collectionName: history.collectionName,
    }).count();

    if (queryHistoryCount >= 20) {
      QueryHistory.remove(QueryHistory.findOne({}, { sort: { date: 1 } })._id);
    }

    QueryHistory.insert(history);
  }

});
