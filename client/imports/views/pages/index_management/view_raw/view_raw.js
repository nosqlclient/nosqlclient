import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';
import './view_raw.html';

Template.viewRaw.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divViewRaw'), txtAreaId: 'txtViewRaw', height: 300 });
});
