/**
 * Created by sercan on 09.02.2016.
 */
Template.fileManagement.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

});
