import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/set/set';
import '/client/imports/views/query_templates_options/upsert/upsert';
import '/client/imports/views/query_templates_options/array_filters/array_filters';
import './update_many.html';

Template.updateMany.onRendered(() => {
  Querying.initOptions(Enums.UPDATE_OPTIONS);
});

Template.updateMany.executeQuery = Querying.Collection.UpdateMany.execute.bind(Querying.Collection.UpdateMany);
Template.updateMany.renderQuery = Querying.Collection.UpdateMany.render.bind(Querying.Collection.UpdateMany);
