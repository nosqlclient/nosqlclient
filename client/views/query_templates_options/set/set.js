/**
 * Created by sercan on 06.01.2016.
 */
Template.set.onRendered(function () {
    Template.initializeCodeMirror($('#divSet'), 'txtSet');
});