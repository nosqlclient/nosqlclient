/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    // set ace editor
    AceEditor.instance("preSelector", {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false
        });
    });
});