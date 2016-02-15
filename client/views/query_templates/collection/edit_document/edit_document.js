/**
 * Created by RSercan on 15.2.2016.
 */
Template.editDocument.onRendered(function () {
    var editor = CodeMirror.fromTextArea($('#txtDocumentEdit'), {
        theme: 'neat'
    });
});