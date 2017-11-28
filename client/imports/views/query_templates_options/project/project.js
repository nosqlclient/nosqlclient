import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './project.html';

Template.project.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divProject'), txtAreaId: 'txtProject' });
});
