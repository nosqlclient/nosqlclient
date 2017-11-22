import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './re_index.html';

Template.reIndex.executeQuery = Querying.Collection.ReIndex.execute;
Template.reIndex.renderQuery = function () {
};
