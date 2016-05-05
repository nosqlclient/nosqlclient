/**
 * Created by RSercan on 20.2.2016.
 */
Template.addCollection.onRendered(function () {
    Template.addCollection.initICheck('divAutoIndexId', true);
    Template.addCollection.initICheck('divIsCapped', false);

});

Template.addCollection.events({
    'click #btnCreateCollection': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    }
});

Template.addCollection.initICheck = function (id, checked) {
    var selector = $('#' + id);
    selector.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    if (checked) {
        selector.iCheck('check');
    } else {
        selector.iCheck('uncheck');
    }
};