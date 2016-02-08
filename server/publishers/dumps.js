/**
 * Created by RSercan on 19.1.2016.
 */
Meteor.publish('dumps', function (connectionId) {
    return Dumps.find({connectionId: connectionId}, {sort: {date: 1}});
});