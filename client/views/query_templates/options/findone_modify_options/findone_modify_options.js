/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneModifyOptions.helpers({
    'isSelected': function (option) {
        return $.inArray(option, Session.get(Template.strSessionSelectedOptions)) != -1;
    }
});

Template.project.onRendered(function () {
    Template.findOneModifyOptions.initializeAceEditor('aceProject');
});

Template.sort.onRendered(function () {
    Template.findOneModifyOptions.initializeAceEditor('aceSort');
});

Template.findOneModifyOptions.initializeAceEditor = function (id) {
    AceEditor.instance(id, {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false
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
        //var name = Template.instance().parentTemplate(2).view.name;
        //var cleanName = name.substring(name.indexOf('.') + 1);
        //if (cleanName == QUERY_TYPES.FIND) {
        //    editor.commands.bindKey("Enter|Shift-Enter", Template.find.executeQuery);
        //}
        //else if (cleanName == QUERY_TYPES.FINDONE) {
        //    editor.commands.bindKey("Enter|Shift-Enter", Template.findOne.executeQuery);
        //}
    });
};