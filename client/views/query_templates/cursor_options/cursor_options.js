/**
 * Created by sercan on 31.12.2015.
 */
Template.cursorOptions.helpers({
    'isSelected': function (option) {
        if (!$.inArray(option, Session.get(Template.strSessionSelectedOptions))) {
            return true;
        }
        return false;
    }
});

/* PROJECT TEMPLATE */
Template.project.onRendered(function () {
    Template.project.initializeAceEditor();
});

Template.project.initializeAceEditor = function () {
    AceEditor.instance("aceProject", {
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
        // disable Enter Shift-Enter keys
        editor.commands.bindKey("Enter|Shift-Enter", Template.find.executeQuery);
    });
}

/* END OF PROJECT TEMPLATE */