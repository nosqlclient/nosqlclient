import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './max.html';

Template.max.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divMax'), txtAreaId: 'txtMax' });
});
