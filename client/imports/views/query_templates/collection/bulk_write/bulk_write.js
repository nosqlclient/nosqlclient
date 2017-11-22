import { Template } from 'meteor/templating';
import { Enums, UIComponents } from '/client/imports/modules';
import { Querying } from '/client/imports/ui';
import './bulk_write.html';

Template.bulkWrite.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divBulkWrite'), txtAreaId: 'txtBulkWrite' });
  Querying.initOptions(Enums.BULK_WRITE_OPTIONS);
});

Template.bulkWrite.executeQuery = Querying.Collection.BulkWrite.execute;
Template.bulkWrite.renderQuery = Querying.Collection.BulkWrite.render;
