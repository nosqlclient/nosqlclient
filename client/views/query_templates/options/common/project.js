/**
 * Created by RSercan on 1.1.2016.
 */
Template.project.onRendered(function () {
    switch (Template.getParentTemplateName(2)) {
        case QUERY_TYPES.FIND:
            Template.initializeAceEditor('aceProject', Template.find.executeQuery);
            break;
        case QUERY_TYPES.FINDONE:
            Template.initializeAceEditor('aceProject', Template.findOne.executeQuery);
            break;
        case QUERY_TYPES.FINDONE_AND_UPDATE:
            Template.initializeAceEditor('aceProject', Template.findOneAndUpdate.executeQuery);
            break;
    }
});