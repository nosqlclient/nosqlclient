/**
 * Created by RSercan on 26.12.2015.
 */
strSessionConnection = 'connection';
strSessionCollectionNames = 'collectionNames';
strSessionSelectedCollection = 'selectedCollection';

clearSessions = function () {
    Session.set(strSessionCollectionNames, undefined);
    Session.set(strSessionConnection, undefined);
    Session.set(strSessionSelectedCollection, undefined);
};

Template.registerHelper(strSessionConnection, function () {
    if (Session.get(strSessionConnection)) {
        return Connections.findOne({_id: Session.get(strSessionConnection)});
    }
});

Template.registerHelper(strSessionCollectionNames, function () {
    return Session.get(strSessionCollectionNames);
});

Template.registerHelper(strSessionSelectedCollection, function () {
    return Session.get(strSessionSelectedCollection);
});
