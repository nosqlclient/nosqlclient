import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/cursor_options/cursor_options';
import './findone.html';

Template.findOne.onRendered(() => {
  Querying.initOptions(Enums.CURSOR_OPTIONS, false, Enums.CURSOR_OPTIONS.LIMIT);
});

Template.findOne.executeQuery = Querying.Collection.FindOne.execute.bind(Querying.Collection.FindOne);
Template.findOne.renderQuery = Querying.Collection.FindOne.render.bind(Querying.Collection.FindOne);
