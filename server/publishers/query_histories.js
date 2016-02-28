/**
 * Created by RSercan on 27.2.2016.
 */
Meteor.publish('queryHistories', function () {
    return QueryHistory.find();
});