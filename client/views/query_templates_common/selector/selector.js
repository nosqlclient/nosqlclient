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

        CodeMirror.hint.javascript = function (editor) {
            var list = Session.get(Template.strSessionDistinctFields) || [];
            var cursor = editor.getCursor();
            var currentLine = editor.getLine(cursor.line);
            var start = cursor.ch;
            var end = start;
            while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
            while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
            var curWord = start != end && currentLine.slice(start, end);
            var regex = new RegExp('^' + curWord, 'i');
            var result = {
                list: (!curWord ? list : list.filter(function (item) {
                    return item.match(regex);
                })).sort(),
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            };

            return result;
        };

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