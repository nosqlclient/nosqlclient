/**
 * Created by RSercan on 3.1.2016.
 */
Template.selector.onRendered(function () {
    Template.initializeCodeMirror($('#divSelector'), 'txtSelector', true);
});

Template.selector.getValue = function () {
    return Template.getCodeMirrorValue($('#divSelector'));
};