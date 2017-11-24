import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/count_options/count_options';
import './count.html';

Template.count.onRendered(() => {
  Querying.initOptions(Enums.COUNT_OPTIONS);
});

Template.count.executeQuery = Querying.Collection.Count.execute.bind(Querying.Collection.Count);
Template.count.renderQuery = Querying.Collection.Count.render.bind(Querying.Collection.Count);
