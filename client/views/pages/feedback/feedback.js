/**
 * Created by RSercan on 9.3.2016.
 */
Template.feedback.events({
    'click #btnLeaveFeedback': function (e) {
        e.preventDefault();
        var laddaButton = $('#btnLeaveFeedback').ladda();
        laddaButton.ladda('start');

        Meteor.call('updateSettings', Template.settings.getSettingsFromForm());
        toastr.success('Successfuly saved !');

        Ladda.stopAll();
    }
});