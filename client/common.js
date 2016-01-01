/**
 * Created by RSercan on 26.12.2015.
 */
Template.strSessionConnection = 'connection';
Template.strSessionCollectionNames = 'collectionNames';
Template.strSessionSelectedCollection = 'selectedCollection';
Template.strSessionSelectedQuery = 'selectedQuery';
Template.strSessionSelectedOptions = "selectedCursorOptions";

Template.clearSessions = function () {
    Session.set(Template.strSessionCollectionNames, undefined);
    Session.set(Template.strSessionConnection, undefined);
    Session.set(Template.strSessionSelectedCollection, undefined);
};

Template.registerHelper('getConnection', function () {
    if (Session.get(Template.strSessionConnection)) {
        return Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    }
});

Template.registerHelper('getCollectionNames', function () {
    return Session.get(Template.strSessionCollectionNames);
});

Template.registerHelper('getSelectedCollection', function () {
    return Session.get(Template.strSessionSelectedCollection);
});


/**
 * Adds remove by value functionality to arrays. e.x. myArray.remove('myValue');
 * */
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

/**
 * Get the parent template instance
 * @param {Number} [levels] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.parentTemplate = function (levels) {
    var view = Blaze.currentView;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.indexOf("Template.") != -1 && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};