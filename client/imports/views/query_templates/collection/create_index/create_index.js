import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/create_index_options/create_index_options';
import './create_index.html';

Template.createIndex.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divFields'), txtAreaId: 'txtFields' });
  Querying.initOptions(Enums.CREATE_INDEX_OPTIONS);
});

Template.createIndex.executeQuery = Querying.Collection.CreateIndex.execute;
Template.createIndex.renderQuery = Querying.Collection.CreateIndex.render;
