import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';

import './drop_index.html';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.dropIndex.onRendered(function () {
    Helper.changeConvertOptionsVisibility(false);
});
Template.dropIndex.events({
    'keypress #inputIndexName'  (event) {
        if (event.keyCode == 13) {
            Template.dropIndex.executeQuery();
            return false;
        }
    }
});

Template.dropIndex.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var indexName = historyParams ? historyParams.indexName : $('#inputIndexName').val();

    var params = {
        indexName: indexName
    };

    Meteor.call("dropIndex", selectedCollection, indexName, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "dropIndex", params, (historyParams ? false : true));
    });
};
