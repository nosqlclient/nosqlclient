/**
 * Created by RSercan on 15.2.2016.
 */
Template.editDocument.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    Template.editDocument.initializeCollectionsCombobox();
    Session.set(Template.strSessionEasyEditID, undefined);

    $('#aConvertIsoDates').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#aConvertObjectIds').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
    Template.changeConvertOptionsVisibility(true);
});

Template.editDocument.events({
    'click #btnFetchDocument': function (e) {
        e.preventDefault();
        Template.editDocument.fetchDocument();
    },

    'click #btnSaveDocument': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnDeleteDocument': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
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

    cmb.on('change', function (evt, params) {
        var selectedCollection = params.selected;
        if (selectedCollection) {
            Template.getDistinctKeysForAutoComplete(selectedCollection);
        }
    });
};

Template.editDocument.initializeResultArea = function (result) {
    var divResult = $('#divResult');

    if (divResult.css('display') == 'none') {
        divResult.show();
        $('#divFooter').show();
    }

    var codeMirror;
    if (!divResult.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById('txtDocument'), {
            mode: "javascript",
            theme: "neat",
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: false,
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                }
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        codeMirror.setSize('%100', 400);
        divResult.data('editor', codeMirror);
    } else {
        codeMirror = divResult.data('editor');
    }

    codeMirror.getDoc().setValue(result);
};

Template.editDocument.deleteDocument = function () {
    var l = $('#btnDeleteDocument').ladda();
    l.ladda('start');

    var collectionName = $('#cmbCollections').find(":selected").text();
    var idQuery = {_id: Session.get(Template.strSessionEasyEditID)};

    Meteor.call('delete', Session.get(Template.strSessionConnection), collectionName, idQuery, function (err, result) {
        if (err) {
            toastr.error("Couldn't delete: " + err.message);
        }
        else if (result.result.result.ok == 1) {
            toastr.success('Successfuly deleted!');
            var divResult = $('#divResult');
            if (divResult.css('display') != 'none') {
                divResult.hide();
                $('#divFooter').hide();
            }

        }
        else {
            toastr.error("Couldn't delete: " + JSON.stringify(result));
        }

        Ladda.stopAll();
    });
};

Template.editDocument.saveDocument = function () {
    var l = $('#btnSaveDocument').ladda();
    l.ladda('start');

    var collectionName = $('#cmbCollections').find(":selected").text();
    var idQuery = {_id: Session.get(Template.strSessionEasyEditID)};
    var setValue = $('#divResult').data('editor').getValue();

    setValue = Template.convertAndCheckJSON(setValue);
    if (setValue["ERROR"]) {
        toastr.error("Syntax error on document: " + setValue["ERROR"]);
        Ladda.stopAll();
        return;
    }
    // remove id just in case
    delete setValue._id;

    setValue = {"$set": setValue};

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call('updateOne', Session.get(Template.strSessionConnection), collectionName, idQuery, setValue, convertIds, convertDates,
        function (err) {
            if (err) {
                toastr.error("Couldn't update: " + err.message);
            } else {
                toastr.success('Successfuly updated !');
            }

            Ladda.stopAll();
        }
    );
};

Template.editDocument.fetchDocument = function () {
    var l = $('#btnFetchDocument').ladda();
    l.ladda('start');

    var collectionName = $('#cmbCollections').find(":selected").text();
    var selector = Template.selector.getValue();

    if (!collectionName) {
        toastr.warning('Please select a collection first !');
        Ladda.stopAll();
        return;
    }

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on query: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("findOne", Session.get(Template.strSessionConnection), collectionName, selector, {}, convertIds, convertDates,
        function (err, result) {
            var divResult = $('#divResult');

            if (err || result.error) {
                Template.showMeteorFuncError(err, result, "Couldn't fetch document");
                if (divResult.css('display') != 'none') {
                    divResult.hide();
                    $('#divFooter').hide();
                }
            }
            else if (!result.result) {
                toastr.error("There's no matched document");
                if (divResult.css('display') != 'none') {
                    divResult.hide();
                    $('#divFooter').hide();
                }
            }
            else {
                Template.editDocument.initializeResultArea(JSON.stringify(result.result, null, '\t'));
                Session.set(Template.strSessionEasyEditID, result.result._id);
            }

            Ladda.stopAll();
        }
    );

};

