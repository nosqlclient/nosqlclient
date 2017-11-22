import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/set/set';
import '/client/imports/views/query_templates_options/upsert/upsert';
import './update_one.html';

Template.updateOne.onRendered(() => {
  Querying.initOptions(Enums.UPDATE_OPTIONS);
});

Template.updateOne.executeQuery = Querying.Collection.UpdateOne.execute;
Template.updateOne.renderQuery = Querying.Collection.UpdateOne.render;
