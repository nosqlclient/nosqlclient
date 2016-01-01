/**
 * Created by sercan on 31.12.2015.
 */
Template.max.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMax');
});

Template.min.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMin');
});

Template.cursorOptions.initializeAceEditor = function (id) {
    // find and findOne templates uses same cursor options so clarify ENTER key event on SELECTOR.
    // disable Enter Shift-Enter keys and bind to executeQuery for corresponding template
    var parentTemplateName = Template.getParentTemplateName(2);
    if (parentTemplateName == QUERY_TYPES.FIND) {
        Template.initializeAceEditor(id, Template.find.executeQuery);
    }
    else if (parentTemplateName == QUERY_TYPES.FINDONE) {
        Template.initializeAceEditor(id, Template.findOne.executeQuery);
    }

};