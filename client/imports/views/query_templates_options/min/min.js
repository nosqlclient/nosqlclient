import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './min.html';

Template.min.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divMin'), txtAreaId: 'txtMin' });
});
