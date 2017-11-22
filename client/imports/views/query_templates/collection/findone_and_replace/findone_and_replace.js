import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import './findone_and_replace.html';

Template.findOneAndReplace.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divReplacement'), txtAreaId: 'txtReplacement' });
  Querying.initOptions(Enums.FINDONE_MODIFY_OPTIONS);
});

Template.findOneAndReplace.executeQuery = Querying.Collection.FindOneAndReplace.execute;
Template.findOneAndReplace.renderQuery = Querying.Collection.FindOneAndReplace.render;
