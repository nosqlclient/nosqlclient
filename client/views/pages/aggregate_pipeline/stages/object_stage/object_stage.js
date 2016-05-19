/**
 * Created by RSercan on 15.5.2016.
 */
Template.objectStage.onRendered(function () {
    var divSelector = $('#divObjectStage');

    var codeMirror;
    if (!divSelector.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById('txtObjectStage'), {
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
    else {
        codeMirror = divSelector.data('editor');
    }

});