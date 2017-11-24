import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/insert_many_options/insert_many_options';
import './insert_many.html';

Template.insertMany.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divDocs'), txtAreaId: 'txtDocs' });
  Querying.initOptions(Enums.INSERT_MANY_OPTIONS);
});

Template.insertMany.executeQuery = Querying.Collection.InsertMany.execute.bind(Querying.Collection.InsertMany);
Template.insertMany.renderQuery = Querying.Collection.InsertMany.render.bind(Querying.Collection.InsertMany);
