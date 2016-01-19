/**
 * Created by RSercan on 19.1.2016.
 */
Meteor.publish('settings', function () {
    return Settings.find();
});