/**
 * Created by RSercan on 15.2.2016.
 */
Template.editDocument.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.editDocument.initializeCollectionsCombobox();
    Template.initializeAceEditor('aceSelector', Template.editDocument.fetchDocument);
});

Template.editDocument.events({
    'click #btnFetchDocument': function (e) {
        e.preventDefault();
        Template.editDocument.fetchDocument();
    }
});

Template.editDocument.initializeCollectionsCombobox = function () {
    var cmb = $('#cmbCollections');
    cmb.append($("<optgroup id='optGroupCollections' label='Collections'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupCollections');

    var collectionNames = Session.get(Template.strSessionCollectionNames);
    $.each(collectionNames, function (index, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", value.name)
            .text(value.name));
    });
    cmb.chosen();
};

Template.editDocument.initializeResultArea = function (result) {
    var divResult = $('#divResult');

    if (divResult.css('display') == 'none') {
        divResult.show();
    }

    var codeMirror;
    if (!divResult.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById('txtDocument'), {
            mode: "javascript",
            theme: "neat",
            lineNumbers: true
        });
        codeMirror.setSize('%100', 450);
        divResult.data('editor', codeMirror);
    } else {
        codeMirror = divResult.data('editor');
    }

    codeMirror.getDoc().setValue(result);
};

Template.editDocument.fetchDocument = function () {
    var collectionName = $('#cmbCollections').find(":selected").text();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    if (!collectionName) {
        toastr.warning('Please select a collection first !');
        return;
    }

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on query: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("findOne", connection, collectionName, selector, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            if (errorMessage) {
                toastr.error("Couldn't fetch document: " + errorMessage);
            } else {
                toastr.error("Couldn't fetch document, unknown reason ");
            }
        }
        else {
            Template.editDocument.initializeResultArea(JSON.stringify(result.result, null, '\t'));
        }

    });

};

