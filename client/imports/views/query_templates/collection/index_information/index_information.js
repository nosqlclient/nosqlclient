import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './index_information.html';

Template.indexInformation.onRendered(() => {
  $('#divFullInformation').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.indexInformation.executeQuery = Querying.Collection.IndexInformation.execute;
Template.indexInformation.renderQuery = Querying.Collection.IndexInformation.render;
