import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import './count.html';

Template.count.onRendered(() => {
  Querying.initOptions(Enums.COUNT_OPTIONS);
});

Template.count.executeQuery = Querying.Collection.Count.execute;
Template.count.renderQuery = Querying.Collection.Count.render;
