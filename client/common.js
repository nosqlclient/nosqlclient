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

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
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
