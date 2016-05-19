/**
 * Created by RSercan on 19.5.2016.
 */
Template.aggregateResultModal.onRendered(function () {
    var jsonEditor = new JSONEditor(document.getElementById('divJsonEditor'), {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view'],
        search: true
    });

    $('#divJsonEditorWrapper').data('jsoneditor', jsonEditor);
});

Template.aggregateResultModal.setResult = function (value) {
    $('#divJsonEditorWrapper').data('jsoneditor').set(value);
};