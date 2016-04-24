/**
 * Created by RSercan on 24.4.2016.
 */
Meteor.publish('actions', function () {
    return Actions.find();
});