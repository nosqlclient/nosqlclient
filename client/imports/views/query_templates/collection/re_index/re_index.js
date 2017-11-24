import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './re_index.html';

Template.reIndex.executeQuery = Querying.Collection.ReIndex.execute.bind(Querying.Collection.ReIndex);
Template.reIndex.renderQuery = function () {
};
