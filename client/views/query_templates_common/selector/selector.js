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

/**
 * Created by RSercan on 3.1.2016.
 */
Template.selector.onRendered(function () {
    var divSelector = $('#divSelector');

    var codeMirror;
    if (!divSelector.data('editor')) {
        codeMirror = CodeMirror.fromTextArea(document.getElementById('txtSelector'), {
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

        codeMirror.on("change", function () {
            Session.set(Template.strSessionSelectorValue, codeMirror.getValue());
        });

        codeMirror.setSize('%100', 100);
        //codeMirror.on("keyup", function (cm, event) {
        //    if (!cm.state.completionActive && event.keyCode != 13) {
        //        CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        //    }
        //});
        divSelector.data('editor', codeMirror);

        $('.CodeMirror').resizable({
            resize: function () {
                codeMirror.setSize($(this).width(), $(this).height());
            }
        });
    }
    else {
        codeMirror = divSelector.data('editor');
    }

    if (Session.get(Template.strSessionSelectorValue)) {
        codeMirror.setValue(Session.get(Template.strSessionSelectorValue));
    }
});

Template.selector.getValue = function () {
    return $('#divSelector').data('editor').getValue();
};