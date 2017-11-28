import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './options.html';

Template.options.executeQuery = Querying.Collection.Options.execute.bind(Querying.Collection.Options);
Template.options.renderQuery = function () {
};
