/**
 * Created by RSercan on 19.1.2016.
 */
Meteor.publish('connections', function () {
    return Connections.find();
});