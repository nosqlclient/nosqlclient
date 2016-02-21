/**
 * Created by RSercan on 3.1.2016.
 */
Template.selector.onRendered(function () {
    var divSelector = $('#divSelector');

    if (!divSelector.data('editor')) {
        var codeMirror = CodeMirror.fromTextArea(document.getElementById('txtSelector'), {
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
        codeMirror.on("keyup", function (cm, event) {
            if (!cm.state.completionActive && event.keyCode != 13) {
                CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
            }
        });
        divSelector.data('editor', codeMirror);
    }
});

Template.selector.getValue = function () {
    return $('#divSelector').data('editor').getValue();
};

//Template.selector.onRendered(function () {
//
// If selector is not in options then we need parent 1, otherwise it's 2
//
//    var eventToBindEnter = null;
//    switch (Template.getParentTemplateName(1)) {
//        case QUERY_TYPES.COUNT:
//            eventToBindEnter = Template.count.executeQuery;
//            break;
//        case QUERY_TYPES.DELETE:
//            eventToBindEnter = Template.delete.executeQuery;
//            break;
//        case QUERY_TYPES.DISTINCT:
//            eventToBindEnter = Template.distinct.executeQuery;
//            break;
//        case QUERY_TYPES.FIND:
//            eventToBindEnter = Template.find.executeQuery;
//            break;
//        case QUERY_TYPES.FINDONE:
//            eventToBindEnter = Template.findOne.executeQuery;
//            break;
//        case QUERY_TYPES.FINDONE_AND_DELETE:
//            eventToBindEnter = Template.findOneAndDelete.executeQuery;
//            break;
//        case QUERY_TYPES.FINDONE_AND_REPLACE:
//            eventToBindEnter = Template.findOneAndReplace.executeQuery;
//            break;
//        case QUERY_TYPES.FINDONE_AND_UPDATE:
//            eventToBindEnter = Template.findOneAndUpdate.executeQuery;
//            break;
//        case QUERY_TYPES.UPDATE_MANY:
//            eventToBindEnter = Template.updateMany.executeQuery;
//            break;
//        case QUERY_TYPES.UPDATE_ONE:
//            eventToBindEnter = Template.updateOne.executeQuery;
//            break;
//    }
//
//    if (eventToBindEnter == null) {
//        switch (Template.getParentTemplateName(2)) {
//            case QUERY_TYPES.GEO_NEAR:
//                eventToBindEnter = Template.geoNear.executeQuery;
//                break;
//            case QUERY_TYPES.MAP_REDUCE:
//                eventToBindEnter = Template.mapReduce.executeQuery;
//                break;
//        }
//    }
//
//    Template.initializeAceEditor('aceSelector', eventToBindEnter);
//});