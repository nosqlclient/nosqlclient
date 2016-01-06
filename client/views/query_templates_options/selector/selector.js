/**
 * Created by RSercan on 3.1.2016.
 */
/**
 * If selector is not in options then we need parent 1, otherwise it's 2
 * */
Template.selector.onRendered(function () {

    var eventToBindEnter = null;
    switch (Template.getParentTemplateName(1)) {
        case QUERY_TYPES.COUNT:
            eventToBindEnter = Template.count.executeQuery;
            break;
        case QUERY_TYPES.DELETE:
            eventToBindEnter = Template.delete.executeQuery;
            break;
        case QUERY_TYPES.DISTINCT:
            eventToBindEnter = Template.distinct.executeQuery;
            break;
        case QUERY_TYPES.FIND:
            eventToBindEnter = Template.find.executeQuery;
            break;
        case QUERY_TYPES.FINDONE:
            eventToBindEnter = Template.findOne.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_DELETE:
            eventToBindEnter = Template.findOneAndDelete.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_REPLACE:
            eventToBindEnter = Template.findOneAndReplace.executeQuery;
            break;
        case QUERY_TYPES.FINDONE_AND_UPDATE:
            eventToBindEnter = Template.findOneAndUpdate.executeQuery;
            break;
    }

    if (eventToBindEnter == null) {
        switch (Template.getParentTemplateName(2)) {
            case QUERY_TYPES.GEO_NEAR:
                eventToBindEnter = Template.geoNear.executeQuery;
                break;
            case QUERY_TYPES.MAP_REDUCE:
                eventToBindEnter = Template.mapReduce.executeQuery;
                break;
        }
    }


    Template.initializeAceEditor('aceSelector', eventToBindEnter);
});