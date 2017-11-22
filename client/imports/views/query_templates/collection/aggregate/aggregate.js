import { Template } from 'meteor/templating';
import { Enums, UIComponents } from '/client/imports/modules';
import { Querying } from '/client/imports/ui';
import './aggregate.html';

Template.aggregate.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divPipeline'), txtAreaId: 'txtPipeline' });
  Querying.initOptions(Enums.AGGREGATE_OPTIONS);
});

Template.aggregate.executeQuery = Querying.Collection.Aggregate.execute;
Template.aggregate.renderQuery = Querying.Collection.Aggregate.render;
