/**
 * Created by RSercan on 1.1.2016.
 */
Template.project.onRendered(function () {
    var eventToBindEnter;
    switch (Template.getParentTemplateName(2)) {
        case QUERY_TYPES.FIND:
            eventToBindEnter = Template.find.executeQuery;
            break;
        case QUERY_TYPES.FINDONE:
            eventToBindEnter = Template.findOne.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_UPDATE:
            eventToBindEnter = Template.findOneAndUpdate.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_REPLACE:
            eventToBindEnter = Template.findOneAndReplace.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_DELETE:
            eventToBindEnter = Template.findOneAndDelete.executeQuery;
            break;
    }

    Template.initializeAceEditor('aceProject', eventToBindEnter);
});