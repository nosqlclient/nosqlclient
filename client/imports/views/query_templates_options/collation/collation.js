import { Template } from 'meteor/templating';
import { UIComponents } from '/client/imports/modules';

import './collation.html';

Template.collation.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCollation'), txtAreaId: 'txtCollation' });
});
