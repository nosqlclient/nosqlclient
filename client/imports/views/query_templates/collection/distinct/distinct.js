import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import './distinct.html';

Template.distinct.onRendered(() => {
  Querying.initOptions(Enums.DISTINCT_OPTIONS);
});

/* Template.distinct.events({
  'keypress #inputField': function (event) {
    if (event.keyCode === 13) {
      Template.distinct.executeQuery();
      return false;
    }
  },
}); */

Template.distinct.executeQuery = Querying.Collection.Distinct.execute.bind(Querying.Collection.Distinct);
Template.distinct.renderQuery = Querying.Collection.Distinct.render.bind(Querying.Collection.Distinct);
