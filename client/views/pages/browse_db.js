/**
 * Created by RSercan on 26.12.2015.
 */

Template.browseDB.onRendered(function () {
    Session.set(Template.strSessionSelectedCollection, undefined);
    Session.set(Template.strSessionSelectedQuery, undefined);
    Session.set(Template.strSessionSelectedOptions, undefined);
});