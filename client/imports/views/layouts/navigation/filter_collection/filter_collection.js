import { Template } from 'meteor/templating';
import { CollectionFilter } from '/client/imports/ui';
import './filter_collection.html';

Template.filterCollection.events({
  'click #btnApplyFilter': function () {
    CollectionFilter.applyFilter();
  }
});
