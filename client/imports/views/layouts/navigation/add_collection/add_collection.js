import { Template } from 'meteor/templating';
import { Notification } from '/client/imports/modules';
import { CollectionAdd } from '/client/imports/ui';
import './options/add_collection_options';
import './add_collection.html';

Template.addCollection.onRendered(() => {
  CollectionAdd.init();
});

Template.addCollection.events({
  'click #anchorStorageEngine': function () {
    if (!$('#anchorStorageEngine').attr('data-toggle')) Notification.warning('views-cant-have-storage-engines');
  },

  'click #anchorValidator': function () {
    if (!$('#anchorValidator').attr('data-toggle')) Notification.warning('views-cant-have-validator');
  },

  'change #cmbCollectionOrView': function () {
    if ($('#cmbCollectionOrView') === 'collection') CollectionAdd.prepareFormAsCollection();
    else CollectionAdd.prepareFormAsView();
  },

  'click #btnCreateCollection': function (event) {
    event.preventDefault();
    CollectionAdd.addCollection();
  },
});
