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
        var isCapped = $('#divIsCapped').iCheck('update')[0].checked;
        var autoIndexId = $('#divAutoIndexId').iCheck('update')[0].checked;
        var collectionName = $('#inputCollectionName').val();
        var size = $('#inputCollectionSize').val();
        var maxDocs = $('#inputMaxDocSize').val();

        if (!collectionName) {
            toastr.error('Collection name is required !');
            return;
        }

        var options = {
            size: size,
            capped: isCapped,
            autoIndexId: autoIndexId,
            max: maxDocs
        };

        var laddaButton = $('#btnCreateCollection').ladda();
        laddaButton.ladda('start');
        
        Meteor.call('createCollection', Session.get(Template.strSessionConnection), collectionName, options, function (err) {
            if (err) {
                toastr.error("Couldn't create collection: " + err.message);
                Ladda.stopAll();
                return;
            }

            Template.navigation.renderCollectionNames();
            $('#collectionAddModal').modal('hide');
            toastr.success('Successfuly created collection: ' + collectionName);

            Ladda.stopAll();
        });
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