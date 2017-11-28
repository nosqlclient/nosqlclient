import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './selector.html';

Template.selector.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divSelector'), txtAreaId: 'txtSelector', keepValue: true });
});
