import { Template } from 'meteor/templating';
import { Enums, UIComponents } from '/client/imports/modules';
import { Querying } from '/client/imports/ui';
import '/client/imports/views/query_templates_options/bulk_write_options/bulk_write_options';
import './bulk_write.html';

Template.bulkWrite.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divBulkWrite'), txtAreaId: 'txtBulkWrite' });
  Querying.initOptions(Enums.BULK_WRITE_OPTIONS);
});

Template.bulkWrite.executeQuery = Querying.Collection.BulkWrite.execute.bind(Querying.Collection.BulkWrite);
Template.bulkWrite.renderQuery = Querying.Collection.BulkWrite.render.bind(Querying.Collection.BulkWrite);
