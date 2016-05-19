/**
 * Created by RSercan on 14.5.2016.
 */
var stageNumbers;
Template.aggregatePipeline.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    $("#stages").sortable({
        connectWith: ".connectList"
    });

    $('#cmbStageQueries').chosen();

    $('#aConvertIsoDates, #aConvertObjectIds').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    stageNumbers = 0;

    Template.aggregatePipeline.initializeCollectionsCombobox();
});

Template.aggregatePipeline.helpers({
    'getStageTemplate': function () {
        if (Session.get(Template.strSessionAggregateStageName)) {
            switch (Session.get(Template.strSessionAggregateStageName)) {
                case '$limit':
                    return 'numberStage';
                case '$skip':
                    return 'numberStage';
                case '$out':
                    return 'stringStage';
                default:
                    return 'objectStage';
            }
        }
    },

    'getStageName': function () {
        return {name: Session.get(Template.strSessionAggregateStageName)};
    }
});

Template.aggregatePipeline.events({
    'change #cmbStageQueries': function (e) {
        var cmb = $("#cmbStageQueries");
        var query = cmb.chosen().val();
        if (query) {
            var liElement = '<li class="success-element" id="stage' + stageNumbers + '">' + query + '<div class="agile-detail">' +
                '<a id="remove-stage-element" href="#" data-number="' + stageNumbers + '" class="pull-right btn btn-xs btn-white"><i class="fa fa-remove"></i> Remove</a>' +
                '<input id="inputNumberStage" min="0" type="number" class="form-control">' +
                '</div> </li>';

            $('#stages').append(liElement);

            Session.set(Template.strSessionAggregateStageName, query);
            cmb.val('').trigger('chosen:updated');
            stageNumbers++;
        }
    },

    'click #remove-stage-element': function (e) {
        e.preventDefault();
        var stageId = '#stage' + $(e.target).data('number');
        $(stageId).remove();
    }
});

Template.aggregatePipeline.initializeCollectionsCombobox = function () {
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