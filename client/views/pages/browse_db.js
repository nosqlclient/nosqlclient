/**
 * Created by RSercan on 26.12.2015.
 */
Template.browseDB.helpers({
    'collectionNames': function () {
        return Session.get(strSessionCollectionNames);
    }

});