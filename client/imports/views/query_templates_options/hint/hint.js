import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './hint.html';

Template.hint.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divHint'), txtAreaId: 'txtHint' });
});
