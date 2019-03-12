import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import $ from 'jquery';

import './stats.html';

Template.stats.onRendered(() => {
  Querying.initOptions(Enums.STATS_OPTIONS);
});

Template.scale.onRendered(() => {
  UIComponents.Checkbox.init($('#inputScale'));
});

Template.stats.executeQuery = Querying.Collection.Stats.execute.bind(Querying.Collection.Stats);
Template.stats.renderQuery = Querying.Collection.Stats.render.bind(Querying.Collection.Stats);
