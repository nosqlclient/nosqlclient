import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/cursor_options/cursor_options';
import './findone.html';

Template.findOne.onRendered(() => {
  Querying.initOptions(Enums.CURSOR_OPTIONS, false);
  // TODO
  /*
    // dont add limit, it will be 1 already
    if (value != Enums.CURSOR_OPTIONS.LIMIT) {
      cmb.append($('<option></option>')
        .attr('value', key)
        .text(value));
    }
  */
});

Template.findOne.executeQuery = Querying.Collection.FindOne.execute;
Template.findOne.renderQuery = Querying.Collection.FindOne.render;
