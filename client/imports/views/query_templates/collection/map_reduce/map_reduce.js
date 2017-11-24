import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/map_reduce_options/map_reduce_options';
import './map_reduce.html';


Template.mapReduce.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divMap'), txtAreaId: 'txtMap' });
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divReduce'), txtAreaId: 'txtReduce' });
  Querying.initOptions(Enums.MAP_REDUCE_OPTIONS);
});

Template.mapReduce.executeQuery = Querying.Collection.MapReduce.execute.bind(Querying.Collection.MapReduce);
Template.mapReduce.renderQuery = Querying.Collection.MapReduce.render.bind(Querying.Collection.MapReduce);
