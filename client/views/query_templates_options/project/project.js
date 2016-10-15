/**
 * Created by RSercan on 1.1.2016.
 */
Template.project.onRendered(function () {
    Template.initializeCodeMirror($('#divProject'), 'txtProject');
});