/**
 * Created by sercan on 31.12.2015.
 */
Template.cursorOptions.helpers({
    'isSelected': function (option) {
        if ($.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1) {
            return true;
        }
        return false;
    }
});

Template.project.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceProject');
});

Template.sort.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceSort');
});

Template.max.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMax');
});

Template.min.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMin');
});

Template.cursorOptions.initializeAceEditor = function (id) {
    AceEditor.instance(id, {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false,
        });

        // remove newlines in pasted text
        editor.on("paste", function (e) {
            e.text = e.text.replace(/[\r\n]+/g, " ");
        });
        // make mouse position clipping nicer
        editor.renderer.screenToTextCoordinates = function (x, y) {
            var pos = this.pixelToScreenCoordinates(x, y);
            return this.session.screenToDocumentPosition(
                Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
                Math.max(pos.column, 0)
            );
        };

        // disable Enter Shift-Enter keys and bind to executeQuery for corresponding template
        var name = Template.instance().parentTemplate(2).view.name;
        var cleanName = name.substring(name.indexOf('.') + 1);
        if (cleanName == QUERY_TYPES.FIND) {
            editor.commands.bindKey("Enter|Shift-Enter", Template.find.executeQuery);
        }
        else if (cleanName == QUERY_TYPES.FINDONE) {
            editor.commands.bindKey("Enter|Shift-Enter", Template.findOne.executeQuery);
        }
    });
}