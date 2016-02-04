/**
 * Created by RSercan on 9.1.2016.
 */
Template.addUser.onRendered(function () {
    Template.addUser.initializeOptions();
});

Template.addUser.initializeOptions = function () {
    var cmb = $('#cmbAddUserOptions');
    $.each(Template.sortObjectByKey(ADD_USER_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.addUser.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var options = Template.addUserOptions.getOptions();
    var username = $('#inputAddUserUsername').val();
    var password = $('#inputAddUserPassword').val();

    if (username == null || username.length === 0) {
        toastr.error('Username can not be empty');
        Ladda.stopAll();
        return;
    }

    if (password == null || password.length === 0) {
        toastr.error('Password can not be empty');
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("addUser", connection, username, password, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "addUser");
    });
};