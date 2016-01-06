/**
 * Created by sercan on 06.01.2016.
 */
Template.set.onRendered(function () {
    var eventToBindEnter = null;
    switch (Template.getParentTemplateName(1)) {
        case QUERY_TYPES.FINDONE_AND_UPDATE:
            eventToBindEnter = Template.findOneAndUpdate.executeQuery;
            break;
        case QUERY_TYPES.UPDATE_MANY:
            eventToBindEnter = Template.updateMany.executeQuery;
            break;
        case QUERY_TYPES.UPDATE_ONE:
            eventToBindEnter = Template.updateOne.executeQuery;
            break;
    }


    Template.initializeAceEditor('aceSet', eventToBindEnter);
});

