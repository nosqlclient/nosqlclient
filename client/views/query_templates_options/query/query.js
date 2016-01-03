/**
 * Created by RSercan on 3.1.2016.
 */
Template.query.onRendered(function () {
    var eventToBindEnter;
    switch (Template.getParentTemplateName(2)) {
        case QUERY_TYPES.GEO_NEAR:
            eventToBindEnter = Template.geoNear.executeQuery;
            break;
        case QUERY_TYPES.MAP_REDUCE:
            eventToBindEnter = Template.mapReduce.executeQuery;
            break;
    }

    Template.initializeAceEditor('aceQuery', eventToBindEnter);
});