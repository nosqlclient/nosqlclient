import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './set.html';

Template.set.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divSet'), txtAreaId: 'txtSet' });
});
