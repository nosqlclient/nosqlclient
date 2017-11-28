import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import $ from 'jquery';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import './command.html';

Template.command.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCommand'), txtAreaId: 'txtCommand' });
  Querying.initOptions(Enums.COMMAND_OPTIONS, true);
});

Template.command.executeQuery = Querying.Admin.executeCommandQuery.bind(Querying.Admin);
