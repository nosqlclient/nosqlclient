import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './options.html';

Template.options.executeQuery = Querying.Collection.Options.execute;
Template.options.renderQuery = function () {
};
