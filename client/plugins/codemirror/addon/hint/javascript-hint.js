// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    var Pos = CodeMirror.Pos;

    function scriptHint(editor, getToken) {
        var cur = editor.getCursor(), token = getToken(editor, cur);
        token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

        var keys = Session.get(Template.strSessionDistinctFields) ? Session.get(Template.strSessionDistinctFields) : [];
        return {
            list: getCompletions(token, keys),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)
        };
    }

    function javascriptHint(editor) {
        return scriptHint(editor,
            function (e, cur) {
                return e.getTokenAt(cur);
            });
    };
    CodeMirror.registerHelper("hint", "javascript", javascriptHint);

    function getCompletions(token, keywords) {
        var found = [], start = token.string;

        for (var i = 0, e = keywords.length; i < e; ++i) {
            if (!start) {
                found.push(keywords[i]);
                continue;
            }

            // replace everything that's not a letter
            start = start.trim().replace(/[^a-zA-Z]+/g, '');
            if (keywords[i].indexOf(start) > -1) {
                found.push(keywords[i]);
            }
        }

        return found;
    }
});
