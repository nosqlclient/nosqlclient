/**
 * Created by RSercan on 26.12.2015.
 */
strSessionConnection = 'connection';
strSessionCollectionNames = 'collectionNames';

Template.registerHelper(strSessionConnection, function () {
    if (Session.get(strSessionConnection)) {
        return Connections.findOne({_id: Session.get(strSessionConnection)});
    }
});

Template.registerHelper(strSessionCollectionNames, function () {
    return Session.get(strSessionCollectionNames);
});