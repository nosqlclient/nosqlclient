var toastr = require('toastr');
var CodeMirror = require("codemirror");

require("/node_modules/codemirror/mode/javascript/javascript.js");
require("/node_modules/codemirror/addon/fold/brace-fold.js");
require("/node_modules/codemirror/addon/fold/comment-fold.js");
require("/node_modules/codemirror/addon/fold/foldcode.js");
require("/node_modules/codemirror/addon/fold/foldgutter.js");
require("/node_modules/codemirror/addon/fold/indent-fold.js");
require("/node_modules/codemirror/addon/fold/markdown-fold.js");
require("/node_modules/codemirror/addon/fold/xml-fold.js");
require("/node_modules/codemirror/addon/hint/javascript-hint.js");
require("/node_modules/codemirror/addon/hint/show-hint.js");


var Ladda = require('ladda');

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

    Template.changeConvertOptionsVisibility(true);
    Template.aggregatePipeline.initializeCollectionsCombobox();
});

Template.aggregatePipeline.events({
    'click #btnExecuteAggregatePipeline': function (e) {
        e.preventDefault();

        var selectedCollection = $("#cmbCollections").chosen().val();
        var stages = $('#stages').find('li');
        if (!selectedCollection) {
            toastr.warning('Please select a collection first !');
            return;
        }

        if (stages.length == 0) {
            toastr.warning('At least one stage is required !');
            return;
        }

        
        var l = Ladda.create(document.querySelector('#btnExecuteAggregatePipeline'));
        l.start();

        var pipeline;
        try {
            pipeline = Template.aggregatePipeline.createPipeline(stages);
        }
        catch (e) {
            toastr.error('One of the stages has error: ' + e);
            Ladda.stopAll();
            return;
        }

        var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
        var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

        Meteor.call("aggregate", selectedCollection, pipeline, convertIds, convertDates,
            function (err, result) {
                if (err || result.error) {
                    Template.showMeteorFuncError(err, result, "Couldn't execute ");
                }
                else {
                    Template.aggregateResultModal.setResult(result.result);
                    $('#aggregateResultModal').modal('show');
                }

                Ladda.stopAll();
            }
        );

    },

    'change #cmbStageQueries': function (e) {
        var cmb = $("#cmbStageQueries");
        var query = cmb.chosen().val();
        if (query) {
            query = '$' + query;
            var liElement = '<li class="success-element" id="stage' + stageNumbers + '">' + query + '<div id="wrapper' + stageNumbers + '" class="agile-detail">' +
                '<a id="remove-stage-element" href="#" data-number="' + stageNumbers + '" class="pull-right btn btn-xs btn-white"><i class="fa fa-remove"></i> Remove</a>';

            var initCodeMirror;
            switch (query) {
                case '$limit':
                    liElement += '<input id="inputNumberStage' + stageNumbers + '" min="0" type="number" class="form-control">';
                    break;
                case '$skip':
                    liElement += '<input id="inputNumberStage' + stageNumbers + '" min="0" type="number" class="form-control">';
                    break;
                case '$out':
                    liElement += '<input type="text" class="form-control" id="txtStringStage' + stageNumbers + '"/>';
                    break;
                default:
                    initCodeMirror = true;
                    liElement += '<textarea id="txtObjectStage' + stageNumbers + '" class="form-control"></textarea>';
                    break;
            }

            liElement += '</div> </li>';
            $('#stages').append(liElement);

            if (initCodeMirror) {
                Template.aggregatePipeline.initCodeMirrorStage();
            }

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

Template.aggregatePipeline.initCodeMirrorStage = function () {
    var divSelector = $('#wrapper' + stageNumbers);

    if (!divSelector.data('editor')) {
        var codeMirror = CodeMirror.fromTextArea(document.getElementById('txtObjectStage' + stageNumbers), {
            mode: "javascript",
            theme: "neat",
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: false,
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                },
                "Ctrl-Space": "autocomplete"
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });

        codeMirror.setSize('%100', 100);
        divSelector.data('editor', codeMirror);
    }
};

Template.aggregatePipeline.createPipeline = function (stageListElements) {
    var pipeline = [];
    stageListElements.each(function (index) {
        var stage = {};

        var liElement = $(this);
        var queryName = liElement.text().split(' ')[0].trim();
        if (liElement.find('[id^=inputNumberStage]').length != 0) {
            stage[queryName] = parseInt(liElement.find('[id^=inputNumberStage]').val());
        } else if (liElement.find('[id^=wrapper]').data('editor')) {
            var jsonValue = liElement.find('[id^=wrapper]').data('editor').getValue();
            jsonValue = Template.convertAndCheckJSON(jsonValue);
            if (jsonValue["ERROR"]) {
                throw queryName + " error: " + jsonValue["ERROR"];
            }
            stage[queryName] = jsonValue;
        }
        else if (liElement.find('[id^=txtStringStage]').length != 0) {
            stage[queryName] = liElement.find('[id^=txtStringStage]').val();
        } else {
            throw queryName;
        }

        pipeline.push(stage);
    });

    return pipeline;
};