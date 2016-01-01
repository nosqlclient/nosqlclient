/**
 * Created by RSercan on 1.1.2016.
 */
Template.sort.onRendered(function () {
    switch (Template.getParentTemplateName(2)) {
        case QUERY_TYPES.FIND:
            Template.initializeAceEditor('aceSort', Template.find.executeQuery);
            break;
        case QUERY_TYPES.FINDONE:
            Template.initializeAceEditor('aceSort', Template.findOne.executeQuery);
            break;
        case QUERY_TYPES.FINDONE_AND_UPDATE:
            Template.initializeAceEditor('aceSort', Template.findOneAndUpdate.executeQuery);
            break;
    }
});