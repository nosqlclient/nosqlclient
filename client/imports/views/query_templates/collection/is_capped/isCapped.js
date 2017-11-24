import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './is_capped.html';

Template.isCapped.onRendered(() => {
});

Template.isCapped.executeQuery = Querying.Collection.IsCapped.execute.bind(Querying.Collection.IsCapped);
Template.isCapped.renderQuery = function () {
};
