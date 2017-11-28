import { Template } from 'meteor/templating';
import $ from 'jquery';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import './rename.html';

Template.rename.onRendered(() => {
  Querying.initOptions(Enums.RENAME_OPTIONS);
});

Template.dropTarget.onRendered(() => {
  $('.i-checks').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});


Template.rename.executeQuery = Querying.Collection.Rename.execute.bind(Querying.Collection.Rename);
