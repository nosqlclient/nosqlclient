/**
 * Created by RSercan on 26.12.2015.
 */
strSessionConnection = 'connection';
strSessionCollectionNames = 'collectionNames';
strSessionSelectedCollection = 'selectedCollection';
strSessionSelectedQuery = 'selectedQuery';

clearSessions = function () {
    Session.set(strSessionCollectionNames, undefined);
    Session.set(strSessionConnection, undefined);
    Session.set(strSessionSelectedCollection, undefined);
};

Template.registerHelper('getConnection', function () {
    if (Session.get(strSessionConnection)) {
        return Connections.findOne({_id: Session.get(strSessionConnection)});
    }
});

Template.registerHelper('getCollectionNames', function () {
    return Session.get(strSessionCollectionNames);
});

Template.registerHelper('getSelectedCollection', function () {
    return Session.get(strSessionSelectedCollection);
});
