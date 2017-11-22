import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import $ from 'jquery';

import './stats.html';

Template.stats.onRendered(() => {
  Querying.initOptions(Enums.STATS_OPTIONS);
});

Template.scale.onRendered(() => {
  $('#divScale').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.stats.executeQuery = Querying.Collection.Stats.execute;
Template.stats.renderQuery = Querying.Collection.Stats.render;
