import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';

import './add_user_options.html';

Template.customData.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCustomData'), txtAreaId: 'txtCustomData' });
});

Template.roles.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divRoles'), txtAreaId: 'txtRoles' });
});
