import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/set/set';
import './findone_and_update.html';

Template.findOneAndUpdate.onRendered(() => {
  Querying.initOptions(Enums.FINDONE_MODIFY_OPTIONS);
});

Template.findOneAndUpdate.executeQuery = Querying.Collection.FindOneAndUpdate.execute.bind(Querying.Collection.FindOneAndUpdate);
Template.findOneAndUpdate.renderQuery = Querying.Collection.FindOneAndUpdate.render.bind(Querying.Collection.FindOneAndUpdate);
